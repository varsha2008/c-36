//Create variables here
var dog,happyDog;
var database;
var foodS,foodStock;
var DogImage;
var feed,addFood;

//variables to store last feeding time
var fedTime,lastFed;

//variable for food class
var foodObj;

var bedroom, garden, washroom; 
var gameState;

function preload()
{
  //load images here
  DogImage = loadImage("Dog.png");
  happyDog = loadImage("happydog.png");
  
  bedroom = loadImage("Bed Room.png");
  garden = loadImage("Garden.png");
  washroom = loadImage("Wash Room.png");
}

function setup() {
  createCanvas(900, 500);
  database = firebase.database();
  dog = createSprite(450,350,50,100);
  dog.addImage(DogImage);
  dog.scale = 0.30;

  foodStock = database.ref('Food');
  foodStock.on("value",readStock);

  foodObj = new Food();
  
  feed = createButton("Feed the Dog");
  feed.position(700,150);
  feed.mousePressed(feedDog);

  addFood = createButton("Add Food");
  addFood.position(800,150);
  addFood.mousePressed(addFoods);

  //read gameState from database
  database.ref('gameState').on("value",function(data){
    gameState = data.val();
  }) 
  
}


function draw() { 
  background(51,255,255); 

  drawSprites();

  //add styles here
  textSize(30);
  stroke("black");
  fill("white");

  text("Press up arrow Key Feed Dog Milk",150,30);
  text("Food remaining: "+foodS, 400, 200);

  //read the lastFed time from the database
  fedTime = database.ref('FeedTime');
  fedTime.on("value",function(data){
    lastFed = data.val();
  })
  
  
  //To show the last feed time
  fill(255,255,254);
  textSize(30);
  if(lastFed>=12){
    text("Last Feed: "+lastFed%12+ " PM",380,80);
  }else if(lastFed === 0){
    text("Last Feed: 12 AM",380,80);
  }else{
    text("Last Feed: "+lastFed+ " AM",380,80);
  }

  //updating gameState
  currentTime = hour();
  if(currentTime ==(lastFed+1)){
    update("Playing");
    foodObj.garden();
  }else if(currentTime ==(lastFed+2)){
    update("Sleeping");
    foodObj.bedroom();
  }else if(currentTime>(lastFed+2) && currentTime<(lastFed+4)){
    update("Bathing");
    foodObj.washroom();
  }else{
    update("Hungry");
    foodObj.display();
  }
  
  //Hide the buttons if not hungry
  if(gameState!= "Hungry"){
    feed.hide();
    addFood.hide();
    dog.remove();
  }else{
    feed.show();
    addFood.show();
    dog.addImage(DogImage);
  }
}



function keyPressed(){
  writeStock(foodS);
  dog.addImage(happyDog);
}

function readStock(data){
  foodS = data.val();
  foodObj.updateFoodStock(foodS);
}

function writeStock(x){
  if(x <= 0){
    x = 0;
  }
  else{
    x = x-2;
  }
  database.ref('/').update({
    Food: x
  })
}
//function to update food stock and last fed time
function feedDog(){
  dog.addImage(happyDog);

  foodObj.updateFoodStock(foodObj.getFoodStock()-1);
  database.ref('/').update({
    Food: foodObj.getFoodStock(),
    FeedTime: hour()
  })
}

//function to add food in stock
function addFoods(){
  foodS++;
  database.ref('/').update({
    Food: foodS
  })
}
//function to update gameStates in database
function update(state){
  database.ref('/').update({
    gameState: state
  });
}

