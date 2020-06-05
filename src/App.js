import React, { Component } from "react";
import * as d3 from "d3";
import * as d3a from "d3-array";
import moment from "moment";
import TweetList from "./components/TweetList.js";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      group: null,
      date: null,
      tweets: [],
      mousing: true,
      filterRetweets: false,
      filterRetweetId: false,
    };
  }

  componentDidMount() {
    d3.csv("subset.csv").then((data) => {
      data = data.map((d) => ({
        ...d,
        retweet_count:
          d.retweet_count < d.retweeted_status_retweet_count
            ? d.retweeted_status_retweet_count
            : d.retweet_count,
      }));

      let group = d3a.group(data, (d) =>
        moment(d.created_at).utc().format("DDD HH")
      );

      this.setState({ data, group });
    });
  }

  mouseOver(d, h, tweets) {
    if (!tweets) {
      tweets = [];
    }

    this.setState({
      tweets,
      date: moment(d + " " + h, "DDD HH"),
    });
  }

  setTweet(id) {
    if (id === this.state.filterRetweetId) {
      this.setState({ filterRetweetId: false });
    } else {
      this.setState({ filterRetweetId: id });
    }
  }

  render() {
    if (!this.state.group)
      return <div>Loading, this could take several minutes.</div>;

    let filterFunction = (v) => {
      if (this.state.filterRetweetId) {
        return +v.retweeted_status_id === +this.state.filterRetweetId;
      } else if (this.state.filterRetweets) {
        return !v.retweeted_status_id;
      } else {
        return true;
      }
    };

    // find maximum
    let values = [];
    this.state.group.forEach((tweets) => {
      tweets = tweets.filter(filterFunction);
      values.push(tweets.length);
    });

    // set up scale
    let colorScale = (v) =>
      d3.interpolateViridis(Math.sqrt(v / d3.max(values)));

    let rows = [];

    for (let d = 57; d < 85; d++) {
      let row = [
        <div className="label" key="label">
          {moment(d, "DDD").format("MMM Do")}
        </div>,
      ];

      for (let h = 0; h < 24; h++) {
        let tweets = this.state.group.get(d + " " + String(h).padStart(2, "0"));
        tweets = tweets ? tweets : [];

        tweets = tweets.filter(filterFunction);

        let n = tweets.length;

        row.push(
          <div
            key={h + d}
            className={
              "val" +
              (!this.state.mousing &&
              this.state.date.format() ===
                moment(d + " " + h, "DDD HH").format()
                ? " active"
                : "")
            }
            onMouseOver={() =>
              this.state.mousing ? this.mouseOver(d, h, tweets) : null
            }
            onClick={() => {
              this.mouseOver(d, h, tweets);
              this.setState({ mousing: !this.state.mousing });
            }}
            style={{ backgroundColor: n === 0 ? "black" : colorScale(n) }}
          ></div>
        );
      }

      rows.push(
        <div className="row" key={d}>
          {row}
        </div>
      );
    }

    return (
      <div className="App">
        <div className="left">
          <div className="options">
            <div className="title">Visualization of tweet dataset</div>
            <div
              className={
                "button" + (this.state.filterRetweets ? " active" : "")
              }
              onClick={() =>
                this.setState({
                  filterRetweets: !this.state.filterRetweets,
                })
              }
            >
              Filter out retweets
            </div>
            {this.state.filterRetweetId ? (
              <div
                className="button"
                onClick={() => this.setState({ filterRetweetId: false })}
              >
                View all tweets
              </div>
            ) : null}
          </div>
          <div className="viz">{rows}</div>
        </div>
        <div className="right">
          <TweetList
            full={!this.state.mousing}
            tweets={this.state.tweets}
            date={this.state.date}
            setTweet={this.setTweet.bind(this)}
            activeTweet={this.state.filterRetweetId}
          />
        </div>
      </div>
    );
  }
}

export default App;
