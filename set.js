/*
 * This is the JS to implement the UI for the Set game and responds to
 * different user interactions with the main webpage
 */
"use strict";
(function() {

  // Required module globals
  let timerId;
  let remainingSeconds;
  const COLOR = ["red", "green", "purple"];
  const STYLE = ["solid", "outline", "striped"];
  const COUNT = ["1", "2", "3"];
  const SHAPE = ["diamond", "oval", "squiggle"];
  window.addEventListener("load", init);

  /**
   * starts the game and initializes interactivity
   */
  function init() {
    // initiates beginning of game with start button
    let start = id("start-btn");
    start.addEventListener("click", () => {
      toggleViews();
      startTimer();
      startBoard();
      refreshBoard();
    });
    let back = id("back-btn");
    back.addEventListener("click", () => {
      toggleViews();
      resetCount();
      clear();
    });
    let refresh = id("refresh-btn");
    refresh.addEventListener("click", () => {
      startBoard();
    });
  }

  /**
   * switches between menu view and game view
   */
  function toggleViews() {
    // game view should start HIDDEN
    let toggleGame = id("game-view");
    let toggleMain = id("menu-view");
    toggleMain.classList.toggle("hidden");
    toggleGame.classList.toggle("hidden");
  }

  /**
   * generates random style shape count and color for set card
   * @param {boolean} isEasy - game mode easy or standard
   * @return {Array} - returns random style, shape, count and color
   */
  function generateRandomAttributes(isEasy) {
    let attributes = [];
    let style = Math.floor(Math.random() * STYLE.length);
    let shape = Math.floor(Math.random() * SHAPE.length);
    let count = Math.floor(Math.random() * COUNT.length);
    let color = Math.floor(Math.random() * COLOR.length);
    if (isEasy) {
      attributes[0] = STYLE[0];
    } else {
      attributes[0] = STYLE[style];
    }
    attributes[1] = SHAPE[shape];
    attributes[2] = COLOR[count];
    attributes[3] = COUNT[color];
    return attributes;
  }

  /**
   * generates a unique card for the board
   * @param {Boolean} isEasy - game mode easy or standard
   * @return {div} - generates new card
   */
  function generateUniqueCard(isEasy) {
    let check = [];
    let cards = qsa("#board > div");
    for (let i = 0; i < cards.length; i++) {
      let add = cards[i].id;
      check.push(add);
    }

    let newCard = gen("div");
    newCard.classList.add("card");
    let ongoing = true;
    while (ongoing) {
      let form = generateRandomAttributes(isEasy);
      let newId = "" + form[0] + "-" + form[1] + "-" + form[2] + "-" + form[3];
      if (!check.includes(newId)) {
        newCard.id = newId;
        let count = form[3];
        for (let i = 0; i < count; i++) {
          let newImg = gen("img");
          newImg.src = "img/" + form[0] + "-" + form[1] + "-" + form[2];
          newImg.src = newImg.src + ".png";
          newImg.alt = newId;
          newCard.appendChild(newImg);
        }
        newCard.addEventListener("click", cardSelected);
        ongoing = false;
        return newCard;
      }
    }
  }

  /**
   * starts new game timer
   */
  function startTimer() {
    let time = qs("select");
    let chosen = time.options[time.selectedIndex].text;
    let timeValue = parseInt(chosen);
    let setTime = id("time");
    setTime.textContent = "0" + timeValue + ":00";
    remainingSeconds = timeValue * 60;
    timerId = setInterval(advanceTimer, 1000);
  }

  /**
   * increases game timer by a second
   */
  function advanceTimer() {
    let setTime = id("time");
    remainingSeconds = remainingSeconds - 1;
    let minutes = Math.floor(remainingSeconds / 60);
    let seconds = Math.floor(remainingSeconds % 60);
    if (seconds < 10) {
      setTime.textContent = "0" + minutes + ":0" + seconds;
    } else {
      setTime.textContent = "0" + minutes + ":" + seconds;
    }
    if (remainingSeconds <= 0) {
      clear();
      disableBoard();
    }
  }

  /**
   * clears and resets timer
   */
  function clear() {
    clearInterval(timerId);
    timerId = null;
  }

  /**
   * checks selected game mode
   * @returns {Boolean} isEasy - game mode easy or standard
   */
  function mode() {
    let isEasy = true;
    let gameMode = qs('input[name="diff"]:checked');
    let gameVal = gameMode.value;
    if (gameVal !== "easy") {
      isEasy = false;
    }
    return isEasy;
  }

  /**
   * clears previous cards and generates new unique cards
   */
  function startBoard() {
    let isEasy = mode();
    let board = id("board");
    while (board.firstChild) {
      board.removeChild((board).lastChild);
    }
    for (let i = 0; i < 12; i++) {
      board.appendChild(generateUniqueCard(isEasy));
    }
  }

  /**
   * resets set count
   */
  function resetCount() {
    id("set-count").textContent = 0;
  }

  /**
   * checks current card selection for sets
   */
  function cardSelected() {
    this.classList.toggle("selected");
    let selected = qsa("#board > .selected");
    if (selected.length < 3) {
      return;
    }
    let checkSet = null;
    checkSet = isASet(selected);
    for (let i = 0; i < selected.length; i++) {
      selected[i].classList.remove("selected");
    }
    if (checkSet) {
      setExists(selected);
    } else {
      for (let i = 0; i < selected.length; i++) {
        selected[i].classList.add("hide-imgs");
        let noSet = gen("p");
        noSet.textContent = "Not a Set";
        selected[i].appendChild(noSet);
        setTimeout(() => {
          selected[i].removeChild(noSet);
          selected[i].classList.remove("hide-imgs");
        }, 1000);
      }
    }
    if (remainingSeconds <= 0) {
      clear();
      disableBoard();
    }
  }

  /**
   * generates new cards if current set exists & increments set count
   * @param {NodeList} selected - current selected cards
   */
  function setExists(selected) {
    let setCount = id("set-count");
    let setNum = parseInt(setCount.textContent);
    setCount.textContent = setNum + 1;
    for (let i = 0; i < selected.length; i++) {
      let isEasy = mode();
      let newCard = generateUniqueCard(isEasy);
      id("board").replaceChild(newCard, selected[i]);
      newCard.classList.add("hide-imgs");
      let yesSet = gen("p");
      yesSet.textContent = "SET!";
      newCard.appendChild(yesSet);
      setTimeout(() => {
        newCard.removeChild(yesSet);
        newCard.classList.remove("hide-imgs");
      }, 1000);
    }
  }

  /**
   * removes selection and disables refresh button
   */
  function disableBoard() {
    let all = qsa("#board > .card");
    for (let i = 0; i < all.length; i++) {
      all[i].classList.remove("selected");
      all[i].removeEventListener("click", cardSelected);
    }
    id("refresh-btn").disabled = true;
  }

  /**
   * activates refresh button
   */
  function refreshBoard() {
    id("refresh-btn").disabled = false;
  }

  /**
   * Checks to see if the three selected cards make up a valid set. This is done by comparing each
   * of the type of attribute against the other two cards. If each four attributes for each card are
   * either all the same or all different, then the cards make a set. If not, they do not make a set
   * @param {DOMList} selected - list of all selected cards to check if a set.
   * @return {boolean} true if valid set false otherwise.
   */
  function isASet(selected) {
    let attributes = [];
    for (let i = 0; i < selected.length; i++) {
      attributes.push(selected[i].id.split("-"));
    }
    for (let i = 0; i < attributes[0].length; i++) {
      let diff = attributes[0][i] !== attributes[1][i] &&
                attributes[1][i] !== attributes[2][i] &&
                attributes[0][i] !== attributes[2][i];
      let same = attributes[0][i] === attributes[1][i] &&
                    attributes[1][i] === attributes[2][i];
      if (!(same || diff)) {
        return false;
      }
    }
    return true;
  }

  /**
   * returns the element with the given id
   * @param {tag} id - HTML tag associated with the element
   * @returns {Element} element associated with given id
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * makes a new element of your chosen type
   * @param {tag} tag - tag type you want to create
   * @returns {tag} - new tag element
   */
  function gen(tag) {
    return document.createElement(tag);
  }

  /**
   * retrieves the first element matched by CSS selector string
   * @param {selector} selector - CSS selector
   * @returns {Element} - first match of the selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * returns an array of all elements matched by given selector
   * @param {selector} selector - CSS selector
   * @returns {Array} - array of all elements under the selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

})();
