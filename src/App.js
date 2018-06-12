import React, { Component } from "react";
import styled from "react-emotion";
const placevalue = require("placevalue-ascii");

const Container = styled("div")`
  overflow: hidden;
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
      placevalueStrings: null,
      didFnError: false,
      shouldRecalcPlacevalueStrings: false
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
  }

  componentDidUpdate(prevProps, prevState) {
    const { shouldRecalcPlacevalueStrings } = this.state;

    if (shouldRecalcPlacevalueStrings) {
      this.recalcPlacevalueStrings();
      this.setState({
        shouldRecalcPlacevalueStrings: false
      });
    }
  }

  setTextSize = (width, height) => {
    this.setState({
      textWidth: width,
      textHeight: height,
      shouldRecalcPlacevalueStrings: true
    });
  };

  handleChange = (field, value) => {
    this.setState({
      [field]: value,
      shouldRecalcPlacevalueStrings: true
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
          place: ((place + 1) % (maxPlace - 1)) + 1
        });
      }
    }, INTERVAL_MS);
  };

  clearInterval = () => {
    clearInterval(this.interval);
    this.interval = null;
  };

  recalcPlacevalueStrings = () => {
    const { fn, textWidth, textHeight, place, yOffset, maxPlace } = this.state;
    let worker = new Worker("worker.js");

    const timeout = setTimeout(() => {
      if (worker) {
        worker.terminate();
        worker = null;
      }
    }, 2000);

    const places = [];
    for (let i = 0; i < maxPlace; i++) {
      places.push(i + 1);
    }

    worker.postMessage([
      `${JSON.stringify(
        places
      )}.map(p=>(${placevalue.toString()})((x,y)=>${fn},${textHeight},${textWidth},p,${yOffset}))`
    ]);

    worker.onmessage = e => {
      clearTimeout(timeout);
      this.setState({
        placevalueStrings: [...e.data]
      });
    };

    worker.onerror = e => {
      clearTimeout(timeout);
      this.setState({ didFnError: true });
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
      placevalueStrings
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
              }
            }}
          >
            *
          </Text>
        )}
        {placevalueStrings && <Text>{placevalueStrings[place] || ""}</Text>}
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
