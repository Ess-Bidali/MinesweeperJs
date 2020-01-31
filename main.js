(function(){
//Event Listeners
// 
window.addEventListener('click', modalClicked);
document.getElementById('btnClose').addEventListener('click', exitModal);
document.getElementById('btnNewGame').addEventListener('click', exitModal);
document.getElementById('btnNewGame').addEventListener('click', startGame);
document.getElementById('newGame').addEventListener('click', startGame);
document.getElementById('begin').addEventListener('click', startGame);

document.getElementById('easy').addEventListener('click', select);
document.getElementById('medium').addEventListener('click', select);
document.getElementById('hard').addEventListener('click', select);
const grid = document.getElementById('grid');

})();
let rows;
let columns;
const modal = document.getElementById('modal');
const result = document.getElementById('result');
const difficulty = document.getElementById('difficulty');
const mode = document.getElementById('mode');

function startGame(event){
  event.preventDefault();
  newGame()
}

function newGame(){
  console.clear();
  setPlayfield();
  printBoard();
  generateBombs(6);
  mapValues();
}

function setPlayfield(){
  document.getElementById('intro').style.display = 'none';
  document.getElementById('centered').style.display = '-webkit-flex';
  document.getElementById('centered').style.display = 'flex';
}

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

function getDifficulty(){
  console.log('got');
  if(mode.innerHTML === 'Easy'){
    rows = 5;
    columns = 8;
  }
  else if (mode.innerHTML === 'Medium'){
    rows = 8;
    columns = 9;
  }
  else if (mode.innerHTML === 'Hard'){
    rows = 10;
    columns = 10;
  }
  else{
    rows = 0;
    columns = 0;
  }
}

function setDifficulty(target){
  mode.innerHTML = target.innerHTML;
  newGame();
}

function select(event){
  difficulty.children[0].classList.remove('selected');
  difficulty.children[1].classList.remove('selected');
  difficulty.children[2].classList.remove('selected');
  event.target.classList.add('selected');
  setDifficulty(event.target);
}

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

function mapValues(){
  for(let r = 0; r < rows; r++){
    for(let c = 0; c < columns; c++){
      let cell = grid.rows[r].cells[c];
      cell.dataset.value = surroundingBombs(cell);
    }
  }
}

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

function hasBomb(r,c){

  if(grid.rows[r].cells[c].dataset.value === "bomb"){
    return true;
  }
  return false;
}

function clicked(event){
  let cell = event.target;
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

function revealCell(cell){
  console.log('run');
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

function youLose(){
  showModal();
  result.innerHTML='';
  result.innerHTML =
  '<h1 class="text-lose">You Lose...</h1>'+
  '<i class="fas fa-heart-broken fa-10x" style="color: orange"></i>' +
  '<p>Better luck next time</p>';
}

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



