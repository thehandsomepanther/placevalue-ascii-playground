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
      place: 6,
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

  handleResize = () => {
    this.forceUpdate();
  };

  render() {
    const { fn, place, yOffset, textHeight, textWidth } = this.state;

    return (
      <div
        style={{
          overflow: "hidden"
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
      </div>
    );
  }
}

export default App;
