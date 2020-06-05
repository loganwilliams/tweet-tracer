import React, { Component } from "react";
import moment from "moment";

export default class TweetList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: "favorite_count",
      hideRepeatedRTs: true,
    };
  }

  render() {
    if (!this.props.date) return <div />;

    let tweets = this.props.tweets;

    if (this.state.hideRepeatedRTs) {
      let f_tweets = {};
      tweets.forEach((t) => {
        if (
          t.retweeted_status_id &&
          !f_tweets.hasOwnProperty(t.retweeted_status_id)
        ) {
          f_tweets[t.retweeted_status_id] = t;
        }
      });

      tweets = tweets
        .filter((t) => !t.retweeted_status_id)
        .concat(Object.values(f_tweets));
    } else if (this.props.activeTweet) {
      tweets = tweets.filter(
        (t) =>
          t.retweeted_status_id === this.props.activeTweet ||
          t.id === this.props.activeTweet
      );
    }

    if (this.state.sortBy === "created_at") {
      tweets = tweets.sort(
        (a, b) => moment(a[this.state.sortBy]) - moment(b[this.state.sortBy])
      );
    } else {
      tweets = tweets.sort(
        (a, b) => b[this.state.sortBy] - a[this.state.sortBy]
      );
    }

    if (!this.props.full) {
      tweets = tweets.slice(0, 10);
    }

    return (
      <div className="TweetList">
        <div className="title">
          <div className="number">
            {tweets.length +
              " displayed / " +
              this.props.tweets.length +
              " total tweets from " +
              this.props.date.format("YYYY-MM-DD HH:mm") +
              " to " +
              moment(this.props.date).add(1, "h").format("YYYY-MM-DD HH:mm")}
          </div>
        </div>
        <div className="options">
          <div
            className={
              "button" +
              (this.state.sortBy === "favorite_count" ? " active" : "")
            }
            onClick={() => this.setState({ sortBy: "favorite_count" })}
          >
            Sort by favorites
          </div>

          <div
            className={
              "button" +
              (this.state.sortBy === "retweet_count" ? " active" : "")
            }
            onClick={() => this.setState({ sortBy: "retweet_count" })}
          >
            Sort by RTs
          </div>

          <div
            className={
              "button" + (this.state.sortBy === "created_at" ? " active" : "")
            }
            onClick={() => this.setState({ sortBy: "created_at" })}
          >
            Sort by time
          </div>

          <div
            className={"button" + (this.state.hideRepeatedRTs ? " active" : "")}
            onClick={() =>
              this.setState({ hideRepeatedRTs: !this.state.hideRepeatedRTs })
            }
          >
            Hide repeated RTs?
          </div>
        </div>

        {tweets.map((t) => {
          return (
            <div
              className={
                "tweet" +
                (t.id === this.props.activeTweet ||
                (t.retweeted_status_id &&
                  t.retweeted_status_id === this.props.activeTweet)
                  ? " active"
                  : "")
              }
              onClick={() =>
                t.retweeted_status_id
                  ? this.props.setTweet(t.retweeted_status_id)
                  : this.props.setTweet(t.id)
              }
            >
              <div className="timestamp">
                {moment(t.created_at).utc().format("HH:mm")}
              </div>
              <div className="favs">{t.favorite_count + " favs"}</div>
              <div className="rts">{t.retweet_count + " RTs"}</div>
              <div className="screenname">
                <a
                  href={"https://twitter.com/" + t.screen_name}
                  target="blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t.screen_name +
                    " (" +
                    t.followers_count +
                    "/" +
                    t.friends_count +
                    ")"}
                </a>
              </div>
              <div className="text">{t.text}</div>
            </div>
          );
        })}
      </div>
    );
  }
}
