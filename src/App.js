import React, { Component } from "react";
import styled from "react-emotion";
const placevalue = require("placevalue-ascii");

const Container = styled("div")`
  overflow: hidden;
  position: relative;
`;

const Text = styled("pre")`
  font-size: 16px;
  line-height: 6px;
  font-family: monospace;
  letter-spacing: -3px;
  display: inline-block;
`;

const ControlsContainer = styled("div")`
  top: 20px;
  left: 20px;
  position: absolute;
  padding: 20px;
  border-radius: 4px;
  background-color: #fafbfc;
  border: 1px solid #e9eaeb;
`;

const INTERVAL_MS = 100;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fn: "x + y",
      place: 7,
      yOffset: 0,
      textWidth: null,
      textHeight: null,
      maxPlace: 20,
      isPlaying: false,
      placevalueString: ""
    };
  }

  get height() {
    const { textHeight } = this.state;
    return Math.floor(window.innerHeight / textHeight);
  }

  get width() {
    const { textWidth } = this.state;
    return Math.floor(window.innerWidth / textWidth);
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentDidUpdate(prevProps, prevState) {
    const { fn, textWidth, textHeight, place, yOffset } = this.state;
    const attributes = ["fn", "place", "yOffset", "textWidth", "textHeight"];

    let shouldRecalcPlacevalueString = false;
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      if (prevState[attribute] !== this.state[attribute]) {
        shouldRecalcPlacevalueString = true;
        break;
      }
    }

    if (shouldRecalcPlacevalueString) {
      this.recalcPlacevalueString(fn, textWidth, textHeight, place, yOffset);
    }
  }

  setTextSize = (width, height) => {
    this.setState({
      textWidth: width,
      textHeight: height
    });
  };

  handleChange = (field, value) => {
    this.setState({
      [field]: value
    });
  };

  handlePlayToggle = () => {
    const { isPlaying } = this.state;
    const newIsPlaying = !isPlaying;

    if (newIsPlaying) {
      this.makeInterval();
    } else {
      this.clearInterval();
    }

    this.setState({
      isPlaying: newIsPlaying
    });
  };

  handleResize = () => {
    this.forceUpdate();
  };

  makeInterval = () => {
    this.interval = setInterval(() => {
      const { isPlaying, place, maxPlace } = this.state;
      if (isPlaying) {
        this.setState({
          place: (place + 1) % maxPlace
        });
      }
    }, INTERVAL_MS);
  };

  clearInterval = () => {
    clearInterval(this.interval);
    this.interval = null;
  };

  recalcPlacevalueString = (fn, textWidth, textHeight, place, yOffset) => {
    let worker = new Worker("worker.js");

    const timeout = setTimeout(() => {
      if (worker) {
        worker.terminate();
        worker = null;
      }
    }, 2000);

    worker.postMessage([
      `(${placevalue.toString()})((x,y)=>${fn},${textHeight},${textWidth},${place},${yOffset})`
    ]);

    console.log(
      `(${placevalue.toString()})((x,y)=>${fn},${textHeight},${textWidth},${place},${yOffset})`
    );

    worker.onmessage = e => {
      clearTimeout(timeout);
      console.log(e);
      this.setState({
        placevalueString: e.data
      });
    };

    worker.onerror = e => {
      clearTimeout(timeout);
    };
  };

  render() {
    const {
      fn,
      place,
      yOffset,
      textHeight,
      textWidth,
      maxPlace,
      isPlaying,
      placevalueString
    } = this.state;

    return (
      <Container>
        {!textHeight && (
          <Text
            innerRef={el => {
              if (el) {
                const { width, height } = el.getBoundingClientRect();
                this.setTextSize(
                  Math.floor(window.innerWidth / width),
                  Math.floor(window.innerHeight / height)
                );
                this.recalcPlacevalueString(fn, width, height, place, yOffset);
              }
            }}
          >
            *
          </Text>
        )}
        {textHeight && <Text>{placevalueString}</Text>}
        <ControlsContainer>
          <div>
            <p className="input-title">Parameters</p>
          </div>
          <div>
            <label>Function</label>
            <input
              type="text"
              value={fn}
              onChange={e => this.handleChange("fn", e.target.value)}
            />
          </div>
          <div>
            <label>Place</label>
            <input
              type="text"
              value={place}
              onChange={e => this.handleChange("place", e.target.value)}
            />
          </div>
          <div>
            <label>Max Place</label>
            <input
              type="text"
              value={maxPlace}
              onChange={e => this.handleChange("maxPlace", e.target.value)}
            />
          </div>
          <div>
            <label>Play</label>
            <input
              type="button"
              value={isPlaying ? "Pause" : "Play"}
              onClick={this.handlePlayToggle}
            />
          </div>
        </ControlsContainer>
      </Container>
    );
  }
}

export default App;
