(function(){
//Event Listeners 
//modal event listeners
window.addEventListener('click', modalClicked);
document.getElementById('btnClose').addEventListener('click', exitModal);
document.getElementById('btnNewGame').addEventListener('click', exitModal);
document.getElementById('btnNewGame').addEventListener('click', startGame);
//navigation event listeners
document.getElementById('newGame').addEventListener('click', startGame);
document.getElementById('easy').addEventListener('click', select);
document.getElementById('medium').addEventListener('click', select);
document.getElementById('hard').addEventListener('click', select);
//one-time use event listeners
document.getElementById('begin').addEventListener('click', startGame);

})();

const grid = document.getElementById('grid');
let rows;
let columns;
let howMany;
const modal = document.getElementById('modal');
const result = document.getElementById('result');
const difficulty = document.getElementById('difficulty');
const mode = document.getElementById('mode');

//button trigger for a new game
function startGame(event){
  event.preventDefault();
  newGame()
}

//to enable a new game when triggered by a button or a function
function newGame(){
  console.clear();
  setPlayfield();
  printBoard();
  generateBombs(howMany);
  mapValues();
}

//clears useless intro information on html
function setPlayfield(){
  document.getElementById('intro').style.display = 'none';
  document.getElementById('centered').style.display = '-webkit-flex';
  document.getElementById('centered').style.display = 'flex';
}

//builds the board with checkerboard appearance
function printBoard(){
  getDifficulty();
  grid.innerHTML = "";
  for(let r = 0; r < rows; r++){
    let row = grid.insertRow();

    for(let c = 0; c < columns; c++){
      let cell = row.insertCell();
      let id = [r,c];
      cell.setAttribute("id", id);
      cell.setAttribute("data-value", '');
      cell.setAttribute("data-isRevealed", 'false');
      cell.setAttribute("data-flagged", 'false');
      cell.addEventListener('mouseup', clicked);
      cell.classList.add('darker');

      if(r%2=== 0 && c%2 === 0 || r%2 !== 0 && c%2 !== 0){
        cell.classList.remove('darker');
        cell.classList.add('lighter');
      }
    }
  }
}

//determines board size and number of mines based on user input. 
//default is 'Easy'
function getDifficulty(){
  if(mode.innerHTML === 'Easy'){
    rows = 5;
    columns = 8;
    howMany = 7;
  }
  else if (mode.innerHTML === 'Medium'){
    rows = 8;
    columns = 9;
    howMany = 10;
  }
  else if (mode.innerHTML === 'Hard'){
    rows = 10;
    columns = 10;
    howMany = 15;
  }
}

//displays selected difficulty level on the html/ui
function setDifficulty(target){
  mode.innerHTML = target.innerHTML;
  newGame();
}

//sets a difficulty level based on user selected value
function select(event){
  difficulty.children[0].classList.remove('selected');
  difficulty.children[1].classList.remove('selected');
  difficulty.children[2].classList.remove('selected');
  event.target.classList.add('selected');
  setDifficulty(event.target);
}

//generates bombs hidden to the player
function generateBombs(howMany){
  for(let i = 0; i < howMany; i++){
    let row = Math.floor(Math.random()*(rows));
    let col = Math.floor(Math.random()*(columns));

    if(hasBomb(row, col)){
      i--;
    }
    else{
      grid.rows[row].cells[col].dataset.value = "bomb";
    }    
  }
}

//sets values showing surrounding bombs per cell
function mapValues(){
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < columns; c++){
      let cell = grid.rows[r].cells[c];
      cell.dataset.value = surroundingBombs(cell);
    }
  }
}

//calculates bombs surrounding a specific cell
function surroundingBombs(cell){
  if(cell.dataset.value !== "bomb"){
    let row = parseInt(cell.id[0]);
    let col = parseInt(cell.id[2]);
    let numOfBombs = '';

    for(let r = -1; r < 2; r++){
      for(c = -1; c < 2; c++){
        if(r === 0 && c === 0 || row + r === -1 || row + r === rows ||
          col + c === -1 || col + c === columns){
          //do nothing
        } else if(hasBomb(row+r, col+c)){
          numOfBombs++;
        }
      }
    }
    return numOfBombs;
  }

  return "bomb";
}

//returns true if a specified cell has a bomb
function hasBomb(r,c){
  if(grid.rows[r].cells[c].dataset.value === "bomb"){
    return true;
  }
  return false;
}

//logic for when a cell is clicked
function clicked(event){
  let cell = event.target;
  //if it's a right click it toggles flagged status
  if(event.button === 2){
    if(cell.dataset.flagged === 'true'){
      cell.dataset.flagged = 'false';
    }
    else{
      cell.dataset.flagged = 'true';
    }
  }
  else{
    revealCell(cell);
    //winning/losing logic
    //reveal bombs after either a win or loss, else, continue game
    if(allRevealed()){
      youWin();
      let intervalId = setInterval(revealBombs,500);
      setInterval(`clearInterval(${intervalId})`,600);
    }
    if(hasBomb(cell.id[0],cell.id[2])){
      youLose();
      let intervalId = setInterval(revealBombs,500);
      setInterval(`clearInterval(${intervalId})`,600);
    }
  }
}

//reveals the value for a cell
function revealCell(cell){
  cell.removeEventListener('mouseup', clicked);
  if(cell.dataset.isRevealed){
    return;
  }

  if(cell.dataset.flagged === 'true'){
    return;
  }
  
  cell.dataset.isRevealed = 'true';

  if(hasBomb(cell.id[0],cell.id[2])){
    console.log('Game Over!');
    cell.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
    changeBg(cell, true);
    return;
  }

  else if(cell.dataset.value === ''){
    let row = parseInt(cell.id[0]);
    let col = parseInt(cell.id[2]);

    for(let r = -1; r < 2; r++){
      for(c = -1; c < 2; c++){
        if(r === 0 && c === 0 || row + r === -1 || row + r === rows ||
          col + c === -1 || col + c === columns){
          //do nothing
        } else{
          revealCell(grid.rows[row+r].cells[col+c]);
        }
      }
    }
  }
  changeBg(cell, false);
  cell.innerHTML = cell.dataset.value;
  return;  
}

//changes cell appearance once clicked
function changeBg(cell,withBomb){
  cell.classList.remove('darker');
  if(!withBomb){
    if(cell.classList.contains('lighter')){
      cell.classList.add('revealed');
      return;
    }
    else{
      cell.classList.add('revealed-2');
      return;
    }
  }
  cell.classList.remove('lighter');
}

//checks whether player has uncovered all cells that
//do not contain bombs, which indicates a win
function allRevealed(){
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < columns; c++){
      if(!hasBomb(r,c)){        
        if(!grid.rows[r].cells[c].dataset.isRevealed){
          return false;
        }
      }
    }
  }
  return true;
}

//shows all the bombs when game ends (after a win or loss)
function revealBombs(){
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < columns; c++){
      grid.rows[r].cells[c].dataset.flagged = 'false';
      if(hasBomb(r,c)){
        revealCell(grid.rows[r].cells[c]);
      }
      grid.rows[r].cells[c].removeEventListener('mouseup', clicked);
    }
  }
  return;
}

//ui stuff for once a player loses
function youLose(){
  showModal();
  result.innerHTML='';
  result.innerHTML =
  '<h1 class="text-lose">You Lose...</h1>'+
  '<i class="fas fa-heart-broken fa-10x" style="color: orange"></i>' +
  '<p>Better luck next time</p>';
}

//ui stuff for once a player wins
function youWin(){
  showModal();
  result.innerHTML='';
  result.innerHTML =
  '<h1 class=""text-win">You Win!</h1>'+
  '<i class="fas fa-medal fa-10x" style="color: Dodgerblue"></i>' +
  '<p>Nice Work!</p>';
}

function showModal(){
  modal.style.display = 'block';
}

function modalClicked(event){
  if(event.target === modal){
    exitModal();
  }
}

function exitModal(event){
  modal.style.display = 'none';
}



