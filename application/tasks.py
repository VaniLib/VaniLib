from datetime import datetime, timedelta
from celery import shared_task
from jinja2 import Template

from .mail_service import send_email
from .models import User, Role, DailyVisit, BookRequest, db
from .user_reports import generate_reports

import os


@shared_task(ignore_result=True)
def daily_reminder():
    for user in User.query.filter(User.roles.any(Role.name == "member")).all():
        daily_visit = DailyVisit.query.filter_by(
            user_id=user.id, date=datetime.today().strftime("%Y-%m-%d")
        ).count()
        if daily_visit == 0:
            with open("templates/daily_reminder.html", "r") as f:
                send_email(
                    user.email,
                    "Vani E-Library | Keep your daily streak going - check out the app.",
                    Template(f.read()).render(name=user.name),
                )
    return "ok"


@shared_task(ignore_result=True)
def send_monthly_report():
    for user in User.query.filter(User.roles.any(Role.name == "member")).all():
        (issued_section, issues_returned, read_books) = generate_reports(user.id)
        with open("templates/monthly_report.html", "r") as f:
            send_email(
                user.email,
                "Vani E-Library | Monthly Report",
                Template(f.read()).render(name=user.name, read_books=read_books),
                image_paths={
                    "section_graph": issued_section,
                    "issued_graph": issues_returned,
                },
            )
        os.remove(issued_section)
        os.remove(issues_returned)


@shared_task(ignore_result=True)
def revoke_overdue_books():
    seven_days_ago = datetime.now() - timedelta(minutes=5)
    # seven_days_ago = datetime.now() - timedelta(days=7)

    overdue_requests = BookRequest.query.filter(
        BookRequest.issue_date <= seven_days_ago,
        BookRequest.is_approved == True,
        BookRequest.is_returned == False,
        BookRequest.is_rejected == False,
        BookRequest.is_revoked == False,
    ).all()

    for request in overdue_requests:
        request.is_revoked = True
    db.session.commit()
