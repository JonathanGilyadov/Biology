import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./css/App.css";

import axios from "axios";
import io from "socket.io-client";
import Game from "./components/game";
import Home from "./containers/home";
import Header from "./containers/header";
import SignUp from "./components/sign-up";
import LogIn from "./components/log-in";
import Profile from "./components/profile";
import QuizPage from "./containers/quizPage";
import CreateQuiz from "./components/createQuiz";
import { useSelector } from "react-redux";
import ReviewCourse from "./components/Courses/reviewCourse";
import StudyProgress from "./components/studyProgress";
import StartLearningPage from "./components/Courses/Topics/startLearningPage";
import Course from "./components/Courses/Course/course";
import CoursesList from "./components/Courses/CoursesList";

import BiologyHistoryPage from "./components/biologyHistoryPage";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as authenticateAction from "./redux/actions/authenticated.js";
import Profiles from "./components/profiles";
import ProfileMember from "./components/memberProfile";

const ENDPOINT = "localhost:5000/";
let socket;

class App extends Component {
  state = {
    userID: ""
  };
  componentDidMount() {
    socket = io(ENDPOINT);
    console.log(socket);
    socket.emit("join", { message: "QWe" });
    axios({
      method: "get",
      url: "http://localhost:5000/users/authenticated",
      headers: {
        authorization: `Bearer ${localStorage.getItem("BiologyPen")}`
      }
    })
      .then(res => {
        const data = res.data;
        //200 = OK
        if (res.status === 200) {
          console.log(data.username);
          const { username, fullName, userID } = data;
          this.props.actions.setIsAuthenticated(
            true,
            fullName,
            username,
            userID
          );
          let updatedState = this.state;
          updatedState.userID = userID;
          this.setState(updatedState);

          socket.emit("online", { message: "here" }, error => {
            if (error) {
              alert(error);
            }
          });
        }
      })
      .catch(err => {
        this.props.actions.setIsAuthenticated(false);
      });
  }
  render() {
    console.log(this.props.authenticated);
    return (
      <Router>
        <React.Fragment>
          <Header />
          <div className="container container-main-section">
            <Switch>
              <Route path="/" exact>
                <Home userID={this.state.userID} />
              </Route>
              <Route path="/startLearning/:topicName/:courseName" exact>
                <ReviewCourse />
              </Route>
              <Route path="/startLearning/:topicName" exact>
                <CoursesList />
              </Route>
              <Route path="/startLearning" exact>
                <StartLearningPage />
              </Route>
              <Route path="/profiles">
                <Profiles />
              </Route>
              <Route path="/biologyHistory">
                <BiologyHistoryPage />
              </Route>
              <Route path="/startLearning/:topicName/:courseName/:stageCourse">
                <Course />
              </Route>
              <Route path="/studyProgress">
                <StudyProgress />
              </Route>
              <Route path="/game">
                <Game />
              </Route>
              <PrivateRoute path="/createQuiz" exact component={CreateQuiz} />
              <Route path="/log-in">
                <LogIn />
              </Route>
              <Route path="/sign-up">
                <SignUp />
              </Route>
              <Route component={ProfileMember} path="/:username" exact />
              <Route path="/:username/quiz/:idQuiz">
                <QuizPage />
              </Route>

              <PrivateRoute path="/profile/:username" component={Profile} />
              {/* A route for handling 404 errors :) */}
              <Route component={NotFound} />
            </Switch>
          </div>
        </React.Fragment>
      </Router>
    );
  }
}

const PrivateRoute = ({ component: Component, ...rest }) => {
  const isAuthenticated = useSelector(state => state).isAuthenticated
    .authenticated;
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated === true ? (
          <Component {...props} />
        ) : (
          <h1>Only Logged users can access this route.</h1>
        )
      }
    />
  );
};

const NotFound = () => <h1>Route doesn't exist!</h1>;

const mapStateToProps = state => ({
  authenticated: state.isAuthenticated
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(authenticateAction, dispatch)
});

const appContainer = connect(mapStateToProps, mapDispatchToProps)(App);

export default appContainer;
