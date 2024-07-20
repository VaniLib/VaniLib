from flask import Flask
from flask_security import Security
from werkzeug.security import generate_password_hash
from celery import Celery, Task

from config import FlaskConfig, CeleryConfig
from application.models import db
from application.resources import api
from application.security import datastore
from application.tasks import (
    daily_reminder,
    revoke_overdue_books,
    send_monthly_report,
)

import os

DB_PATH = os.path.join(os.path.dirname(__file__), "instance", "database.db")

app = Flask(__name__)
app.config.from_object(FlaskConfig)
db.init_app(app)
api.init_app(app)
app.security = Security(app, datastore)

with app.app_context():
    import application.views

    if not os.path.exists(DB_PATH):
        print("db file: ", DB_PATH)
        print("==== DB FILE DOES NOT EXIST, CREATING ONE =====\n")
        db.create_all()

        print("Creating roles...")
        datastore.find_or_create_role(
            name="member", description="Users those who can borrow books"
        )
        datastore.find_or_create_role(
            name="librarian", description="Users those who can manage books"
        )
        db.session.commit()
        print("Roles created successfully...\n")

        print("Adding librarian...")
        datastore.create_user(
            name="Librarian",
            email="lib@email.com",
            password=generate_password_hash("pass123"),
            roles=["librarian"],
            active=True,
        )
        db.session.commit()
        print("Librarian added successfully...\n")
    else:
        print("==== DB FILE EXISTS =====\n")

    def celery_init_app(app, config):
        class FlaskTask(Task):
            def __call__(self, *args: object, **kwargs: object) -> object:
                with app.app_context():
                    return self.run(*args, **kwargs)

        celery_app = Celery(app.name, task_cls=FlaskTask)
        celery_app.config_from_object(config)
        celery_app.set_default()
        app.extensions["celery"] = celery_app
        return celery_app

    print("Starting celery worker...")
    celery_app = celery_init_app(app, config=CeleryConfig)

    @celery_app.on_after_configure.connect
    def automated_tasks(sender, **kwargs):
        sender.add_periodic_task(
            30,
            daily_reminder.s(),
        )

        sender.add_periodic_task(
            60,
            revoke_overdue_books.s(),
        )

        sender.add_periodic_task(
            30,
            send_monthly_report.s(),
        )

    print("Celery worker started successfully...\n")
