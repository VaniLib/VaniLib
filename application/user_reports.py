from datetime import datetime, timedelta
from matplotlib import pyplot as plt

from application.models import BookRequest, Section, db, User, Book

import base64, io, os, uuid


def get_books_issued_by_section_last_30_days(user_id):
    return (
        db.session.query(Section.section_name, db.func.count(Book.book_id))
        .join(Book, Section.section_id == Book.section_id)
        .join(BookRequest, Book.book_id == BookRequest.book_id)
        .join(User, User.id == BookRequest.user_id)
        .filter(
            BookRequest.issue_date >= (datetime.now() - timedelta(days=30)),
            BookRequest.user_id == user_id,
            BookRequest.is_approved == True,
        )
        .group_by(Section.section_name)
        .all()
    )


def get_books_issued_vs_returned_last_30_days(user_id):
    return (
        db.session.query(
            BookRequest.issue_date,
            db.func.count(BookRequest.id).label("issued"),
            db.func.sum(db.cast(BookRequest.is_returned, db.Integer)).label("returned"),
        )
        .filter(
            BookRequest.issue_date >= (datetime.now() - timedelta(days=30)),
            BookRequest.user_id == user_id,
        )
        .group_by(BookRequest.issue_date)
        .all()
    )


def read_book_in30_days(user_id):
    return (
        BookRequest.query.filter_by(user_id=user_id, is_approved=True)
        .filter(BookRequest.issue_date > (datetime.now() - timedelta(days=30)))
        .all()
    )


def save_plot_to_base64():
    buffer = io.BytesIO()
    plt.savefig(buffer, format="png")
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    plt.close()
    return image_base64


def generate_reports(user_id):
    books_issued_by_section = get_books_issued_by_section_last_30_days(user_id)
    books_issued_vs_returned = get_books_issued_vs_returned_last_30_days(user_id)

    section_names = [item[0] for item in books_issued_by_section]
    books_issued_counts = [item[1] for item in books_issued_by_section]
    plt.figure(figsize=(10, 6))
    plt.bar(section_names, books_issued_counts)
    plt.xlabel("Section")
    plt.ylabel("Number of books issued")
    plt.title("Number of books issued by section (Last 30 Days)")
    plt.xticks(rotation=90)
    plt.tight_layout()
    issued_section = os.path.join(f"./{uuid.uuid4()}.png")
    with open(issued_section, "wb") as f:
        f.write(base64.b64decode(save_plot_to_base64()))

    dates = [item[0] for item in books_issued_vs_returned]
    issued_counts = [item[1] for item in books_issued_vs_returned]
    returned_counts = [item[2] for item in books_issued_vs_returned]
    plt.figure(figsize=(10, 6))
    plt.plot(dates, issued_counts, marker="o", label="Issued")
    plt.plot(dates, returned_counts, marker="o", label="Returned")
    plt.xlabel("Date")
    plt.ylabel("Number of books")
    plt.title("Total books issued vs. returned (Last 30 Days)")
    plt.xticks(rotation=90)
    plt.legend()
    plt.tight_layout()
    issued_vs_returned = os.path.join(f"./{uuid.uuid4()}.png")
    with open(issued_vs_returned, "wb") as f:
        f.write(base64.b64decode(save_plot_to_base64()))

    return (
        issued_section,
        issued_vs_returned,
        read_book_in30_days(user_id),
    )
