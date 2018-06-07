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
      fn: (x, y) => x * x * y * y,
      place: 7,
      yOffset: 0,
      textWidth: null,
      textHeight: null,
      maxPlace: 20,
      isPlaying: false
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

  render() {
    const {
      fn,
      place,
      yOffset,
      textHeight,
      textWidth,
      maxPlace,
      isPlaying
    } = this.state;

    return (
      <Container>
        {!textHeight && (
          <Text
            innerRef={el => {
              if (el) {
                const { width, height } = el.getBoundingClientRect();
                this.setTextSize(width, height);
              }
            }}
          >
            *
          </Text>
        )}
        {textHeight && (
          <Text>{placevalue(fn, this.height, this.width, place, yOffset)}</Text>
        )}
        <ControlsContainer>
          <div>
            <p className="input-title">Parameters</p>
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
