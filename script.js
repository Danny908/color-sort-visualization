// Container element...
const container = document.getElementById('visualization');
// Status element...
const status = document.getElementById('status');
// Method elements...
const bubble = document.getElementById('bubble');
const modifiedBubble = document.getElementById('modified-bubble');

const Sorter = (function (container, status) {
  const colors = [];
  const limit = 360;
  let comparations = 0;

  function setup() {
    for (let i = 0; i <= limit; i++) {
      const div = document.createElement('div');
      const color = `hsl(${i}, 100%, 50%)`;

      colors.push(color);
      div.setAttribute('class', 'color');
      div.style.backgroundColor = color;
      div.style.transform = `rotate(${i}deg)`;
      container.appendChild(div);
    }
  }

  function statusEvent(detail) {
    return new CustomEvent('statusChange', { detail });
  }

  function startCounter() {
    let mm = 0;
    let ss = 0;
    let ms = 0;
    counter = setInterval(() => {
      if (ms === 1000) {
        ms = 0;
        ss += 1;
      }

      if (ss === 60) {
        ss = 0;
        mm += 1;
      }
      // Emit status...
      const time = `${mm > 9 ? mm : `0${mm}`}:${ss > 9 ? ss : `0${ss}`}:${
        ms > 99 ? ms : ms > 9 ? `0${ms}` : `00${ms}`
      }`;
      status.dispatchEvent(statusEvent({ time }));
      ms += 10;
    }, 10);
  }

  function updateChild(index) {
    container.children[index].style.backgroundColor = colors[index];
  }

  function shuffle() {
    return new Promise((resolve) => {
      // Emit status...
      status.dispatchEvent(
        statusEvent({ time: 'Randomizing...', status: 'running' })
      );
      for (let index = 0; index <= limit; index++) {
        // Delay to see updates on DOM...
        setTimeout(() => {
          const random = Math.floor(Math.random() * 361);
          const temp = colors[index];
          colors[index] = colors[random];
          colors[random] = temp;
          updateChild(index);
          index === limit && resolve(true);
        }, index * 2);
      }
    });
  }

  function hueValue(hue) {
    return Number.parseInt(hue.match(/\d{1,3}/)[0], 10);
  }

  function bubbleMethod(index, sorted, latest = null) {
    setTimeout(() => {
      const current = colors[index];
      const next = colors[index + 1];

      if (hueValue(current) > hueValue(next)) {
        sorted = false;
        colors[index] = next;
        colors[index + 1] = current;
        updateChild(index);
        updateChild(index + 1);
      }
      comparations += 1;
      status.dispatchEvent(statusEvent({ comparations }));
      if (index + 1 < (latest || limit)) {
        bubbleMethod(index + 1, sorted, latest);
      } else if (!sorted) {
        bubbleMethod(0, true, latest && latest - 1);
      } else {
        clearInterval(counter);
        status.dispatchEvent(statusEvent({ status: 'stopped' }));
      }
    });
  }

  return {
    init: (name, listener) => setup(name, listener),
    bubble: () => {
      status.dispatchEvent(statusEvent({ type: 'Bubble' }));
      shuffle().then(() => {
        startCounter();
        bubbleMethod(0, true);
      });
    },
    modifiedBubble: () => {
      status.dispatchEvent(statusEvent({ type: 'Modified Bubble' }));
      shuffle().then(() => {
        startCounter();
        bubbleMethod(0, true, limit);
      });
    },
  };
})(container, status);

// Init render...
Sorter.init();

// Status listener...
let time = 0;
let comparations = 0;
let type = '';
let isRunning = '';
status.addEventListener('statusChange', (ev) => {
  const { detail } = ev;
  time = detail.time ? detail.time : time;
  comparations = detail.comparations ? detail.comparations : comparations;
  type = detail.type ? detail.type : type;
  isRunning = detail.status ? detail.status : isRunning;
  status.innerText = `${type}\nRun Time: ${time}\nComparations: ${comparations}`;

  if (isRunning === 'running') {
    bubble.setAttribute('disabled', 'true');
    modifiedBubble.setAttribute('disabled', 'true');
  } else {
    bubble.removeAttribute('disabled');
    modifiedBubble.removeAttribute('disabled');
  }
});

// Method listeners...
bubble.addEventListener('click', () => Sorter.bubble());
modifiedBubble.addEventListener('click', () => Sorter.modifiedBubble());
