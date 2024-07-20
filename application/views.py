from flask import current_app as app, request, jsonify, render_template
from werkzeug.security import check_password_hash, generate_password_hash

from .models import User, db
from .security import datastore


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/user_login")
def user_login():
    form_data = request.get_json()

    if not form_data.get("email") or not form_data.get("password"):
        return jsonify({"message": "Provide with both Email-ID and Password..."}), 400

    user = datastore.find_user(email=form_data.get("email"))

    if user is None:
        return jsonify({"message": "User Not Found... Please Register first!!"}), 404

    if check_password_hash(user.password, form_data.get("password")):
        return jsonify(
            {
                "token": user.get_auth_token(),
                "email": user.email,
                "role": user.roles[0].name,
                "username": user.name,
            }
        )
    else:
        return jsonify({"message": "Please check the password provided..."}), 400


@app.post("/user_register")
def user_register():
    form_data = request.get_json()

    if (
        not form_data.get("email")
        or not form_data.get("password")
        or not form_data.get("name")
    ):
        return jsonify({"message": "All fields are mandatory..."}), 400

    user_exists = User.query.filter_by(email=form_data.get("email")).count()

    if user_exists > 0:
        return jsonify({"message": "Email already taken, use another email..."}), 401

    user = datastore.create_user(
        email=form_data.get("email"),
        name=form_data.get("name"),
        password=generate_password_hash(form_data.get("password")),
        active=True,
        roles=["member"],
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(
        {
            "token": user.get_auth_token(),
            "email": user.email,
            "role": user.roles[0].name,
            "username": user.name,
        }
    )
