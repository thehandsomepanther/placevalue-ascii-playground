import React, { Component } from "react";
import styled from "react-emotion";
const placevalue = require("placevalue-ascii");

const Container = styled("div")`
  overflow: hidden;
  font-family: monospace;
`;

const Text = styled("pre")`
  font-size: 16px;
  line-height: 6px;
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

const fns = [
  "3 * (x**2 - y**2)",
  "x**4 + y**4",
  "x*x*y*y",
  "5 * Math.sqrt(x*x + y*y)"
];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fn: Math.floor(Math.random() * fns.length),
      place: 7,
      yOffset: 0,
      textWidth: null,
      textHeight: null,
      maxPlace: 20,
      isPlaying: false,
      placevalueStrings: null,
      didFnError: false,
      shouldRecalcPlacevalueStrings: false,
      intervalMS: 100,
      shouldHideControlsModal: false
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("keydown", this.handleKeyDown);
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

  handleFnShuffleClick = () => {
    const { fn } = this.state;
    let indexOfFn = fns.indexOf(fn);
    let rand;
    do {
      rand = Math.floor(Math.random() * fns.length);
    } while (rand === indexOfFn);

    this.setState({
      fn: fns[rand],
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

  handleKeyDown = e => {
    const { place, shouldHideControlsModal } = this.state;
    switch (e.keyCode) {
      // ESC
      case 27:
        this.setState({ shouldHideControlsModal: !shouldHideControlsModal });
        break;
      // C
      case 67:
        this.handlePlayToggle();
        break;
      // J
      case 74:
        this.decrementPlace();
        break;
      // K
      case 75:
        this.incrementPlace();
        break;
    }
  };

  makeInterval = () => {
    const { intervalMS } = this.state;
    this.interval = setInterval(() => {
      const { isPlaying, place, maxPlace } = this.state;
      if (isPlaying) {
        this.incrementPlace();
      }
    }, intervalMS);
  };

  clearInterval = () => {
    clearInterval(this.interval);
    this.interval = null;
  };

  incrementPlace = () => {
    const { place, maxPlace } = this.state;
    this.setState({ place: (place % maxPlace) + 1 });
  };

  decrementPlace = () => {
    const { place, maxPlace } = this.state;
    this.setState({
      place: place > 1 ? place - 1 : maxPlace
    });
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
      placevalueStrings,
      intervalMS,
      shouldHideControlsModal
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
        {!shouldHideControlsModal && (
          <ControlsContainer>
            <div>
              <p>Controls</p>
              <table>
                <tbody>
                  <tr>
                    <td>ESC</td>
                    <td>Hide controls modal</td>
                  </tr>
                  <tr>
                    <td>c</td>
                    <td>Toggle play/pause</td>
                  </tr>
                  <tr>
                    <td>j</td>
                    <td>Decrement place</td>
                  </tr>
                  <tr>
                    <td>k</td>
                    <td>Increment place</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <p>Parameters</p>
            </div>
            <div>
              <label>Function: (x, y) ⇒</label>
              <input
                type="text"
                value={fn}
                onChange={e => this.handleChange("fn", e.target.value)}
              />
              <input
                type="button"
                value="Try a random one"
                onClick={this.handleFnShuffleClick}
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
                placeholder={1}
                onChange={e => this.handleChange("maxPlace", e.target.value)}
              />
            </div>
            <div>
              <label>Interval (Milliseconds)</label>
              <input
                type="text"
                value={intervalMS}
                onChange={e => this.handleChange("intervalMS", e.target.value)}
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
        )}
      </Container>
    );
  }
}

export default App;
