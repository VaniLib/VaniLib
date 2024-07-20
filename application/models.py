from flask_security import RoleMixin, UserMixin, current_user
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    description = db.Column(db.String)


class RolesUsers(db.Model):
    __tablename__ = "roles_users"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column("user_id", db.Integer, db.ForeignKey("users.id"))
    role_id = db.Column("role_id", db.Integer, db.ForeignKey("role.id"))


class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    active = db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)

    roles = db.relationship(
        "Role", secondary="roles_users", backref=db.backref("users", lazy="dynamic")
    )


class Book(db.Model):
    __tablename__ = "books"
    book_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    author = db.Column(db.String)
    prologue = db.Column(db.Text)
    title = db.Column(db.String)
    content = db.Column(db.Text)
    image = db.Column(db.String)

    section_id = db.Column(db.Integer, db.ForeignKey("sections.section_id"))
    section = db.relationship("Section", backref="books")

    @property
    def num_of_book_pending_for_me(self):
        approved_books_count = BookRequest.query.filter_by(
            user_id=current_user.id,
            is_approved=True,
            is_revoked=False,
            is_returned=False,
        ).count()
        non_approved_books = BookRequest.query.filter_by(
            user_id=current_user.id,
            is_approved=False,
            is_rejected=False,
            is_revoked=False,
            is_returned=False,
        ).count()
        return approved_books_count + non_approved_books

    @property
    def is_pending_for_me(self):
        rqs = BookRequest.query.filter_by(
            book_id=self.book_id,
            is_approved=False,
            is_rejected=False,
            is_revoked=False,
            user_id=current_user.id,
        ).all()
        return True if len(rqs) > 0 else False

    @property
    def is_approved_for_me(self):
        rqs = BookRequest.query.filter_by(
            book_id=self.book_id,
            is_approved=True,
            is_returned=False,
            is_revoked=False,
            user_id=current_user.id,
        ).all()
        return True if len(rqs) > 0 else False

    @property
    def request_id(self):
        if self.is_approved_for_me:
            qs = BookRequest.query.filter_by(
                book_id=self.book_id,
                is_approved=True,
                is_returned=False,
                user_id=current_user.id,
            ).first()
            return qs.id
        return None

    @property
    def wrote_review(self):
        rqs = Feedback.query.filter_by(
            book_id=self.book_id, user_id=current_user.id
        ).all()
        return True if len(rqs) > 0 else False


class BookRequest(db.Model):
    __tablename__ = "book_requests"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    is_approved = db.Column(db.Boolean, default=False, nullable=True)
    is_rejected = db.Column(db.Boolean, default=False, nullable=True)
    is_returned = db.Column(db.Boolean, default=False, nullable=True)
    is_revoked = db.Column(db.Boolean, default=False, nullable=True)
    issue_date = db.Column(db.Date, nullable=True)
    return_date = db.Column(db.Date, nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    book_id = db.Column(db.Integer, db.ForeignKey("books.book_id"))

    user = db.relationship("User", backref="requests")
    book = db.relationship("Book", backref="requests")


class Section(db.Model):
    __tablename__ = "sections"
    section_id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    section_name = db.Column(db.String(25))
    section_description = db.Column(db.String(50))
    date_created = db.Column(db.Date)


class Feedback(db.Model):
    __tablename__ = "feedbacks"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    feedback = db.Column(db.String)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    book_id = db.Column(db.Integer, db.ForeignKey("books.book_id"))

    user = db.relationship("User", backref="feedbacks")
    book = db.relationship("Book", backref="feedbacks")


class DailyVisit(db.Model):
    __tablename__ = "daily_visits"
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    date = db.Column(db.Date)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))

    user = db.relationship("User", backref="visits")
