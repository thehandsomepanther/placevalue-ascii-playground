import React, { Component } from "react";
const placevalue = require("placevalue-ascii");

const styles = {
  fontSize: "16px",
  lineHeight: "6px",
  fontFamily: "monospace",
  letterSpacing: "-3px"
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fn: (x, y) => x * x * y * y,
      place: 7,
      yOffset: 0,
      textWidth: null,
      textHeight: null
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

  handleResize = () => {
    this.forceUpdate();
  };

  render() {
    const { fn, place, yOffset, textHeight, textWidth } = this.state;

    return (
      <div
        style={{
          overflow: "hidden",
          position: "relative"
        }}
      >
        {!textHeight && (
          <pre
            style={{ ...styles, display: "inline-block" }}
            ref={el => {
              if (el) {
                const { width, height } = el.getBoundingClientRect();
                this.setTextSize(width, height);
              }
            }}
          >
            *
          </pre>
        )}
        {textHeight && (
          <pre style={styles}>
            {placevalue(fn, this.height, this.width, place, yOffset)}
          </pre>
        )}
        <div
          style={{
            top: "20px",
            left: "20px",
            position: "absolute",
            padding: "20px",
            borderRadius: "4px",
            backgroundColor: "#fafbfc",
            border: "1px solid #e9eaeb"
          }}
        >
          <div>
            <p className="input-title">Parameters</p>
          </div>
          <div className="input-group">
            <label className="input-label">Place</label>
            <input
              type="text"
              value={place}
              onChange={e => this.handleChange("place", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
