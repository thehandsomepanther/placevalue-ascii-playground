onmessage = e => {
  let data = e.data[0];

  let workerResult = null;
  (() => {
    var e = null;
    workerResult = eval(data);
  })();

  self.postMessage(workerResult);
};
