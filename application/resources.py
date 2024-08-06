import matplotlib

matplotlib.use("Agg")

import base64
import uuid
import matplotlib.pyplot as plt
import os
import io
import csv

from matplotlib.ticker import MaxNLocator
from datetime import datetime
from io import BytesIO
from flask import request, jsonify, Response
from flask_restful import Resource, Api, reqparse, fields, marshal
from flask_security import current_user, auth_required, roles_required
from sqlalchemy import text
from werkzeug.utils import secure_filename


from application.models import (
    User,
    Book,
    db,
    Section,
    BookRequest,
    Feedback,
    DailyVisit,
)


def log_user_visits():
    if current_user is not None and "member" in current_user.roles:
        visited = DailyVisit.query.filter_by(
            user_id=current_user.id,
            date=datetime.today().strftime("%Y-%m-%d"),
        ).count()
        if visited == 0:
            db.session.add(DailyVisit(user_id=current_user.id, date=datetime.today()))
            db.session.commit()


api = Api(prefix="/api")

user = {"id": fields.Integer, "name": fields.String, "email": fields.String}
review = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "book_id": fields.Integer,
    "feedback": fields.String,
    "user": fields.Nested(user),
}

section_marshal_fields = {
    "section_id": fields.Integer,
    "section_name": fields.String,
    "section_description": fields.String,
    "date_created": fields.DateTime(dt_format="iso8601"),
    "books": fields.Nested(
        {
            "book_id": fields.Integer,
            "prologue": fields.String,
            "author": fields.String,
            "section_id": fields.Integer,
            "title": fields.String,
            "content": fields.String,
            "image": fields.String,
            "pdf": fields.String,
            "is_pending_for_me": fields.Boolean,
            "is_approved_for_me": fields.Boolean,
            "is_completed_by_me": fields.Boolean,
            "num_of_book_pending_for_me": fields.Integer,
        }
    ),
}

book_marshal_fields = {
    "book_id": fields.Integer,
    "prologue": fields.String,
    "author": fields.String,
    "section_id": fields.Integer,
    "title": fields.String,
    "content": fields.String,
    "image": fields.String,
    "pdf": fields.String,
    "section": fields.Nested(section_marshal_fields),
    "is_pending_for_me": fields.Boolean,
    "is_approved_for_me": fields.Boolean,
    "is_completed_by_me": fields.Boolean,
    "wrote_review": fields.Boolean,
    "request_id": fields.Raw,
    "requests": fields.Nested(
        {
            "id": fields.Integer,
            "user_id": fields.Integer,
            "user": fields.Nested(user),
            "book_id": fields.Integer,
            "is_approved": fields.Boolean,
            "is_rejected": fields.Boolean,
            "is_returned": fields.Boolean,
            "is_revoked": fields.Boolean,
            "issue_date": fields.DateTime(dt_format="iso8601"),
            "return_date": fields.DateTime(dt_format="iso8601"),
        }
    ),
    "num_of_book_pending_for_me": fields.Integer,
    "feedbacks": fields.Nested(review),
}

book_requests_marshal_field = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "book_id": fields.Integer,
    "is_approved": fields.Boolean,
    "is_rejected": fields.Boolean,
    "is_returned": fields.Boolean,
    "is_revoked": fields.Boolean,
    "book": fields.Nested(book_marshal_fields),
    "user": fields.Nested(user),
    "issue_date": fields.DateTime(dt_format="iso8601"),
    "return_date": fields.DateTime(dt_format="iso8601"),
}


user_marshal_field = {
    "id": fields.Integer,
    "name": fields.String,
    "roles": {"name": fields.String},
}


class BookHandler(Resource):

    @auth_required("token")
    def get(self, book_id=None):
        book_list = None
        if book_id is None:
            log_user_visits()
            book_list = Book.query.order_by(text("book_id desc")).all()
        else:
            book_list = Book.query.get(book_id)
        return marshal(book_list, book_marshal_fields)

    @auth_required("token")
    def delete(self, book_id):
        Feedback.query.filter_by(book_id=book_id).delete()
        BookRequest.query.filter_by(book_id=book_id).delete()

        book_obj = Book.query.filter_by(book_id=book_id)
        book = book_obj.all()[0]
        if book.image != "no_image_found.png":
            os.remove("static/uploaded/image/" + book.image)
        if len(book.pdf) > 0:
            os.remove("static/uploaded/pdf/" + book.pdf)
        book_obj.delete()

        db.session.commit()

    def parse_input(self):
        parser = reqparse.RequestParser()
        parser.add_argument("author", required=True, location="form")
        parser.add_argument("title", required=True, location="form")
        parser.add_argument("content", required=True, location="form")
        parser.add_argument("section", required=True, location="form")
        parser.add_argument("prologue", required=True, location="form")
        args = parser.parse_args(request)
        return args

    def check_input(self, args):
        if (
            args.get("title") == ""
            or args.get("author") == ""
            or args.get("content") == ""
            or args.get("section") == ""
        ):
            return {"message": "Title, Author, Content, Section are mandatory"}, 401
        return None

    @auth_required("token")
    def put(self, book_id):
        args = self.parse_input()
        resp = self.check_input(args)
        if resp is not None:
            return resp

        is_already_added = Book.query.filter(
            Book.title.like(f"{args.get('title')}")
        ).all()
        if len(set([book.book_id for book in is_already_added]) - {book_id}):
            return {"message": "Book name is already taken"}, 403

        book = Book.query.get(book_id)

        image_filename = book.image
        if "image" in request.files and request.files["image"]:
            file = request.files["image"]
            if "no_image_found.png" in image_filename:
                image_filename = (
                    str(uuid.uuid4()) + "_" + secure_filename(file.filename)
                )
            file.save("static/uploaded/image/" + image_filename)
            file.close()

        pdf_filename = book.pdf
        if "pdf" in request.files and request.files["pdf"]:
            file = request.files["pdf"]
            if len(pdf_filename) == 0:
                pdf_filename = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
            file.save("static/uploaded/pdf/" + pdf_filename)
            file.close()

        book.author = args.get("author")
        book.title = args.get("title")
        book.content = args.get("content")
        book.prologue = args.get("prologue")
        book.section_id = args.get("section")
        book.image = image_filename
        book.pdf = pdf_filename
        db.session.commit()

    @auth_required("token")
    def post(self):
        args = self.parse_input()
        resp = self.check_input(args)
        if resp is not None:
            return resp

        if len(Book.query.filter_by(title=args.get("title")).all()):
            return {"message": "Book with same title already exists"}, 401

        image_file = ""
        if "image" in request.files and request.files["image"]:
            file = request.files["image"]
            image_file = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
            file.save("static/uploaded/image/" + image_file)
            file.close()
        else:
            image_file = "no_image_found.png"

        pdf_file = ""
        if "pdf" in request.files and request.files["pdf"]:
            file = request.files["pdf"]
            pdf_file = str(uuid.uuid4()) + "_" + secure_filename(file.filename)
            file.save("static/uploaded/pdf/" + pdf_file)
            file.close()

        db.session.add(
            Book(
                author=args.get("author"),
                title=args.get("title"),
                content=args.get("content"),
                prologue=args.get("prologue"),
                section_id=args.get("section"),
                image=image_file,
                pdf=pdf_file,
            )
        )
        db.session.commit()


class SectionHandler(Resource):
    @auth_required("token")
    def get(self, section_id=None):
        if section_id is None:
            return marshal(Section.query.all(), section_marshal_fields)
        else:
            return marshal(Section.query.get(section_id), section_marshal_fields)

    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("section_name", required=True)
        parser.add_argument("section_description", required=True)
        args = parser.parse_args()

        if args.get("section_name", "") == "":
            return {"message": "Section Name is required"}, 401

        is_already_added = Section.query.filter(
            Section.section_name.like(f"{args.get('section_name')}")
        ).all()

        if len(is_already_added) > 0:
            return {"message": "Section already exists"}, 401

        db.session.add(
            Section(
                section_name=args.get("section_name"),
                section_description=args.get("section_description"),
                date_created=datetime.today(),
            )
        )
        db.session.commit()

    @auth_required("token")
    @roles_required("librarian")
    def put(self, section_id):
        parser = reqparse.RequestParser()
        parser.add_argument("section_name", required=True)
        parser.add_argument("section_description", required=True)
        args = parser.parse_args()

        if args.get("section_name") == "":
            return {"message": "Section Name is required"}, 401

        is_already_added = Section.query.filter(
            Section.section_name.like(f"{args.get('section_name')}")
        ).all()
        if len(set([sec.section_id for sec in is_already_added]) - {section_id}):
            return {"message": "Section name is already taken"}, 401

        edit_section = Section.query.get(section_id)
        edit_section.section_name = args.get("section_name")
        edit_section.section_description = args.get("section_description")
        db.session.commit()

    @roles_required("librarian")
    def delete(self, section_id):
        books_names = [
            book.title for book in Book.query.filter_by(section_id=section_id).all()
        ]
        if len(books_names) > 0:
            return {
                "message": "Books are associated with this section either delete the books or change the section before deleting",
                "book_names": books_names,
            }, 403

        db.session.delete(Section.query.get(section_id))
        db.session.commit()


class RequestBooks(Resource):
    @auth_required("token")
    def get(self, book_id):
        db.session.add(BookRequest(user_id=current_user.id, book_id=book_id))
        db.session.commit()


class ReturnBook(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = BookRequest.query.get(request_id)
        req.is_returned = True
        req.return_date = datetime.today()
        db.session.add(req)
        db.session.commit()


class ApproveBook(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = BookRequest.query.get(request_id)
        req.is_approved = True
        req.issue_date = datetime.today()
        db.session.add(req)
        db.session.commit()


class RejectBook(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = BookRequest.query.get(request_id)
        req.is_rejected = True
        db.session.add(req)
        db.session.commit()


class RevokeBook(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = BookRequest.query.get(request_id)
        req.is_revoked = True
        db.session.add(req)
        db.session.commit()


class BookRequests(Resource):
    @auth_required("token")
    def get(self):
        pending = marshal(
            BookRequest.query.filter_by(is_approved=False, is_rejected=False).all(),
            book_requests_marshal_field,
        )
        approved = marshal(
            BookRequest.query.filter_by(is_approved=True, is_returned=True).all(),
            book_requests_marshal_field,
        )
        return jsonify({"pending": pending, "approved": approved})


class UserResource(Resource):
    @auth_required("token")
    def get(self, user_id=None):
        if user_id is None:
            return marshal(
                [user for user in User.query.all() if "member" in user.roles],
                user_marshal_field,
            )
        else:
            requested, approved, completed = set(), set(), set()
            for request in BookRequest.query.filter_by(user_id=user_id).all():
                appr, rej, ret, rev = (
                    request.is_approved,
                    request.is_rejected,
                    request.is_returned,
                    request.is_revoked,
                )
                if not rej and not rev:
                    if True not in [appr, ret]:
                        requested.add(request.book.book_id)
                    elif appr:
                        if ret:
                            completed.add(request.book.book_id)
                        else:
                            approved.add(request.book.book_id)

            return jsonify(
                {
                    "requested": marshal(
                        Book.query.filter(Book.book_id.in_(requested)).all(),
                        book_marshal_fields,
                    ),
                    "approved": marshal(
                        Book.query.filter(Book.book_id.in_(approved)).all(),
                        book_marshal_fields,
                    ),
                    "completed": marshal(
                        Book.query.filter(Book.book_id.in_(completed)).all(),
                        book_marshal_fields,
                    ),
                }
            )


class Search(Resource):
    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("search", required=True)
        args = parser.parse_args()

        search = "%{}%".format(args.get("search"))

        sections = Section.query.filter(Section.section_name.like(search)).all()
        books = Book.query.filter(
            Book.title.like(search) | Book.author.like(search)
        ).all()
        return {
            "sections": marshal(sections, section_marshal_fields),
            "books": marshal(books, book_marshal_fields),
        }


class AddReview(Resource):
    @auth_required("token")
    def post(self, book_id):
        parser = reqparse.RequestParser()
        parser.add_argument("review", required=True)
        args = parser.parse_args()

        db.session.add(
            Feedback(
                book_id=book_id, user_id=current_user.id, feedback=args.get("review")
            )
        )
        db.session.commit()


def get_plt_bytes():
    buffer = BytesIO()
    plt.tight_layout()
    plt.savefig(buffer, format="png")
    buffer.seek(0)
    bytes = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    return bytes


class LibrarianReport(Resource):

    def generate_plts(self):
        section_counts, issued_counts, date_count = {}, {}, {}
        for book in Book.query.all():
            section_name = book.section.section_name
            section_counts[section_name] = section_counts.get(section_name, 0) + 1
            issued_counts[book.title] = BookRequest.query.filter_by(
                book_id=book.book_id,
                is_approved=True,
                is_rejected=False,
                is_returned=False,
                is_revoked=False,
            ).count()

        for u_entry in DailyVisit.query.all():
            date = str(u_entry.date)
            date_count[date] = date_count.get(date, 0) + 1

        ax = plt.figure().gca()
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        plt.bar(section_counts.keys(), section_counts.values(), color="green")
        plt.title("Book Distribution by Section")
        plt.xlabel("Section")
        plt.ylabel("Number of Books")
        plt.xticks(rotation=90)
        plot_data_section = get_plt_bytes()

        ax = plt.figure().gca()
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        plt.bar(issued_counts.keys(), issued_counts.values())
        plt.xlabel("Books")
        plt.ylabel("Number of Issued Requests")
        plt.title("Number of Issued Requests by Book")
        plt.xticks(rotation=90)
        plot_data_book = get_plt_bytes()

        ax = plt.figure().gca()
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))
        plt.bar(date_count.keys(), date_count.values(), color="blue")
        plt.title("Number of user visits per day")
        plt.xlabel("Date")
        plt.ylabel("Number of User Visits")
        plt.xticks(rotation=90)
        plot_data_visit = get_plt_bytes()

        return {
            "plot_data_section": plot_data_section,
            "plot_data_book": plot_data_book,
            "plot_data_visit": plot_data_visit,
        }

    def get(self, generate_pdf=None):
        if generate_pdf is None:
            return self.generate_plts()
        else:
            import time
            time.sleep(10)
            csv_output = io.StringIO()

            writer = csv.writer(csv_output)
            writer.writerow(
                [
                    "Book Name",
                    "User Name",
                    "Issued Date",
                    "Returned Date",
                    "IsApproved",
                    "IsReturned",
                ]
            )
            for req in marshal(BookRequest.query.all(), book_requests_marshal_field):
                writer.writerow(
                    [
                        req["book"]["title"].upper(),
                        req["user"]["name"].upper(),
                        req["issue_date"],
                        req["return_date"],
                        req["is_approved"],
                        req["is_returned"],
                    ]
                )

            return Response(
                csv_output.getvalue().encode("utf-8"), content_type="text/csv"
            )


class MyRequests(Resource):
    @auth_required("token")
    def get(self):
        return marshal(
            BookRequest.query.filter_by(user_id=current_user.id).all()[::-1],
            book_requests_marshal_field,
        )


# Utility routes
api.add_resource(Search, "/search")
api.add_resource(MyRequests, "/my_requests")
api.add_resource(AddReview, "/review/<int:book_id>")

api.add_resource(UserResource, "/users", "/users/<int:user_id>")

# Librarian report route
api.add_resource(LibrarianReport, "/lib/report", "/lib/report/<int:generate_pdf>")

# Book request handling routes
api.add_resource(RequestBooks, "/request_book/<int:book_id>")
api.add_resource(ReturnBook, "/return_request/<int:request_id>")
api.add_resource(ApproveBook, "/approve_request/<int:request_id>")
api.add_resource(RejectBook, "/reject_request/<int:request_id>")
api.add_resource(RevokeBook, "/revoke_request/<int:request_id>")
api.add_resource(BookRequests, "/book_requests")

# Section handling routes
api.add_resource(SectionHandler, "/section", "/section/<int:section_id>")

# Book handling routes
api.add_resource(BookHandler, "/book", "/book/<int:book_id>")
