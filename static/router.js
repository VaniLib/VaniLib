import Home from "./components/home.js";
import Login from "./components/login.js";
import Register from "./components/register.js";

import AllBooks from './components/all_book.js'
import ApprovedBooks from './components/approved_books.js'
import CompletedBooks from './components/completed_books.js'
import ReadBook from "./components/read_book.js";
import EditBook from "./components/edit_book.js"

import AllSections from "./components/all_section.js";
import BookRequests from "./components/book_requests.js";
import ViewSection from "./components/view_section.js";

import UserInfo from "./components/user_info.js";

import SearchResult from "./components/search_result.js";
import AdminStat from "./components/admin_stat.js";
import MyRequests from "./components/my_requests.js";
import ListUser from "./components/list_user.js";

const routes = [
    { path: "/", component: Home, name: "Home" },
    { path: "/login", component: Login, name: "Login" },
    { path: "/register", component: Register, name: "Register" },

    { path: "/books", component: AllBooks, name: "AllBooks" },
    { path: "/approved_books", component: ApprovedBooks, name: "ApprovedBooks" },
    { path: "/completed_books", component: CompletedBooks, name: "CompletedBooks" },
    { path: "/read/:id", component: ReadBook, name: "ReadBook" },
    { path: "/edit_book/:id", component: EditBook, name: "EditBook" },

    { path: "/sections", component: AllSections, name: "AllSection" },
    { path: "/requests", component: BookRequests, name: "BookRequests" },
    { path: "/section/:id", component: ViewSection, name: "ViewSection" },

    { path: "/users_info/:id", component: UserInfo, name: "UserInfo" },

    { path: "/search_result", component: SearchResult, name: "SearchResult" },
    { path: "/admin_stat", component: AdminStat, name: "AdminStat" },
    { path: "/my_requests", component: MyRequests, name: "MyRequests" },
    { path: "/list_users", component: ListUser, name: "ListUser" },
];

const router = new VueRouter({ routes });

router.beforeEach((to, from, next) => {
    let isLoggedIn = localStorage.getItem("auth-token");
    if (["Register", "Login"].includes(to.name)) {
        if (isLoggedIn) {
            next({ name: "Home" })
        } else {
            next()
        }
    } else {
        if (isLoggedIn) {
            next()
        } else {
            next({ name: "Login" })
        }
    }
});

export default router;