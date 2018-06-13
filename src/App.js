import React, { Component } from "react";
import styled from "react-emotion";
const placevalue = require("placevalue-ascii");
const Shake = require("shake.js");

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

const TableHeader = styled("p")`
  margin-bottom: 4px;
`;

const ControlsTable = styled("table")`
  width: 100%;
  margin-bottom: 20px;
`;

const TextInput = styled("input")`
  border: 2px solid ${p => (p.valid ? "none" : "#FF4136")};
`;

const fns = [
  "3 * (x**2 - y**2)",
  "x**4 + y**4",
  "x*x*y*y",
  "5 * Math.sqrt(x*x + y*y)"
];

const shakeEvent = new Shake({
  threshold: 15,
  timeout: 1000
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fn: fns[Math.floor(Math.random() * fns.length)],
      place: 7,
      yOffset: 0,
      xOffset: 0,
      textWidth: null,
      textHeight: null,
      maxPlace: 9,
      isPlaying: false,
      placevalueStrings: null,
      didFnError: false,
      shouldRecalcPlacevalueStrings: false,
      intervalMS: 100,
      shouldHideControlsModal: false
    };

    shakeEvent.start();
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("shake", this.handleShake);
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

  handleShake = () => {
    const { shouldHideControlsModal } = this.state;
    this.setState({ shouldHideControlsModal: !shouldHideControlsModal });
  };

  handleKeyDown = e => {
    const { shouldHideControlsModal } = this.state;
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
      default:
        break;
    }
  };

  makeInterval = () => {
    const { intervalMS } = this.state;
    this.interval = setInterval(() => {
      const { isPlaying } = this.state;
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
    const {
      fn,
      textWidth,
      textHeight,
      yOffset,
      xOffset,
      maxPlace
    } = this.state;
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
      )}.map(p=>(${placevalue.toString()})((x,y)=>${fn},${textHeight},${textWidth},p,${yOffset},${xOffset}))`
    ]);

    worker.onmessage = e => {
      clearTimeout(timeout);
      this.setState({
        placevalueStrings: [...e.data],
        didFnError: false
      });
    };

    worker.onerror = e => {
      clearTimeout(timeout);
      if (e.message.indexOf("SyntaxError") > -1) {
        this.setState({ didFnError: true });
      }
    };
  };

  render() {
    const {
      fn,
      place,
      yOffset,
      xOffset,
      textHeight,
      textWidth,
      maxPlace,
      placevalueStrings,
      intervalMS,
      shouldHideControlsModal,
      didFnError
    } = this.state;

    return (
      <Container>
        {!textHeight &&
          !textWidth && (
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
              <div>
                <TableHeader>Controls</TableHeader>
              </div>
              <ControlsTable>
                <tbody>
                  <tr>
                    <td>{`ESC${
                      "ondevicemotion" in window ? "/shake device" : ""
                    }`}</td>
                    <td>Toggle controls modal</td>
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
              </ControlsTable>
            </div>
            <div>
              <div>
                <TableHeader>Parameters</TableHeader>
              </div>
              <ControlsTable>
                <tbody>
                  <tr>
                    <td>
                      <label>(x, y) ⇒ </label>
                    </td>
                    <td>
                      <TextInput
                        type="text"
                        value={fn}
                        placeholder="e.g. x + y"
                        onChange={e => this.handleChange("fn", e.target.value)}
                        valid={!didFnError}
                      />
                      <input
                        type="button"
                        value="Random"
                        onClick={this.handleFnShuffleClick}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Place</label>
                    </td>
                    <td>
                      <TextInput
                        type="text"
                        value={place}
                        placeholder="Integer greater than 1"
                        onChange={e =>
                          this.handleChange("place", e.target.value)
                        }
                        valid={place && place > 0}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Max Place</label>
                    </td>
                    <td>
                      <TextInput
                        type="text"
                        value={maxPlace}
                        placeholder="Integer greater than 1"
                        onChange={e =>
                          this.handleChange("maxPlace", e.target.value)
                        }
                        valid={maxPlace && maxPlace > 0}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Y Offset</label>
                    </td>
                    <td>
                      <TextInput
                        type="text"
                        value={yOffset}
                        placeholder="Integer"
                        onChange={e =>
                          this.handleChange("yOffset", e.target.value)
                        }
                        valid={!Number.isNaN(parseInt(yOffset, 10))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>X Offset</label>
                    </td>
                    <td>
                      <TextInput
                        type="text"
                        value={xOffset}
                        placeholder="Integer"
                        onChange={e =>
                          this.handleChange("xOffset", e.target.value)
                        }
                        valid={!Number.isNaN(parseInt(xOffset, 10))}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label>Interval (MS)</label>
                    </td>
                    <td>
                      <TextInput
                        type="text"
                        value={intervalMS}
                        placeholder="Integer"
                        onChange={e =>
                          this.handleChange("intervalMS", e.target.value)
                        }
                        valid={intervalMS && intervalMS > 0}
                      />
                    </td>
                  </tr>
                </tbody>
              </ControlsTable>
            </div>
            <div>
              <a href="https://github.com/mouse-reeve/placevalue_ascii">
                What is this?
              </a>
            </div>
            <div>
              <a href="https://github.com/thehandsomepanther/placevalue-ascii-playground">
                Github
              </a>
            </div>
          </ControlsContainer>
        )}
      </Container>
    );
  }
}

export default App;
