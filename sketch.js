// Variáveis do jogo

let money = 100;

let day = 1;

let reputation = 50;

let selectedTool = null;

let crops = [];

let gameWon = false;

let tooltip = { message: "", visible: false };

// Inventário

let inventory = {

  "Trigo": { quantity: 0, price: 10, emoji: "🌾" },

  "Milho": { quantity: 0, price: 15, emoji: "🌽" },

  "Tomate": { quantity: 0, price: 20, emoji: "🍅" },

  "Cenoura": { quantity: 0, price: 18, emoji: "🥕" },

  "Morango": { quantity: 0, price: 25, emoji: "🍓" },

  "Maçã": { quantity: 0, price: 22, emoji: "🍎" }

};

let marketPrices = {};

let sellButtonY = 0; // Variável para armazenar a posição Y do botão de vender

// Estados do jogo

const GAME_STATES = {

  FARM: 0,

  CITY: 1

};

let currentState = GAME_STATES.FARM;

// Configurações do campo

const FIELD_ROWS = 5;

const FIELD_COLS = 8;

const CELL_SIZE = 80;

const FIELD_X = 50;

const FIELD_Y = 100;

function setup() {

  let canvas = createCanvas(800, 600);

  canvas.parent('canvas-container');

  

  // Inicializar preços de mercado

  updateMarketPrices();

  

  // Configurar botões

  document.getElementById('plant-btn').textContent = '🌱 Plantar';

  document.getElementById('harvest-btn').textContent = '✂️ Colher';

  document.getElementById('sell-btn').textContent = '🏙️ Ir para Cidade';

  document.getElementById('next-day-btn').textContent = '⏭️ Próximo Dia';

  

  // Event listeners

  document.getElementById('plant-btn').addEventListener('click', () => {

    selectedTool = 'plant';

    showTooltip('Selecione um quadrado para plantar');

  });

  

  document.getElementById('harvest-btn').addEventListener('click', () => {

    selectedTool = 'harvest';

    showTooltip('Selecione um cultivo maduro para colher');

  });

  

  document.getElementById('sell-btn').addEventListener('click', toggleCity);

  document.getElementById('next-day-btn').addEventListener('click', nextDay);

  

  updateUI();

}

function draw() {

  background(240);

  

  if (gameWon) {

    displayWinScreen();

    return;

  }

  

  // Desenhar cabeçalho dentro do canvas

  fill(255);

  rect(0, 0, width, 80);

  fill(0);

  textSize(24);

  textAlign(LEFT);

  text(`Dinheiro: R$ ${money}`, 20, 30);

  text(`Dia: ${day}`, 20, 60);

  textAlign(RIGHT);

  text(`Reputação: ${reputation}%`, width - 20, 30);

  

  if (currentState === GAME_STATES.FARM) {

    drawFarm();

  } else {

    drawCity();

  }

  

  // Mostrar tooltip

  if (tooltip.visible) {

    drawTooltip();

  }

}

function drawFarm() {

  // Desenhar grade do campo

  for (let row = 0; row < FIELD_ROWS; row++) {

    for (let col = 0; col < FIELD_COLS; col++) {

      const x = FIELD_X + col * CELL_SIZE;

      const y = FIELD_Y + row * CELL_SIZE;

      

      fill(210, 180, 140);

      stroke(180);

      rect(x, y, CELL_SIZE, CELL_SIZE);

      

      // Verificar se há cultivo nesta célula

      const crop = crops.find(c => c.row === row && c.col === col);

      if (crop) {

        drawCrop(x, y, crop);

      }

    }

  }

}

function drawCrop(x, y, crop) {

  // Cores de fundo para os cultivos

  const colors = {

    "Trigo": "#f5deb3",

    "Milho": "#fffacd",

    "Tomate": "#ffcccb",

    "Cenoura": "#ffb347",

    "Morango": "#ff6961",

    "Maçã": "#ff7373"

  };

  

  fill(colors[crop.type] || "#f5deb3");

  rect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 5);

  

  // Emoji do cultivo

  textSize(24);

  textAlign(CENTER, CENTER);

  fill(0);

  text(inventory[crop.type].emoji, x + CELL_SIZE/2, y + CELL_SIZE/2 - 5);

  

  // Barra de crescimento

  if (crop.growth < 100) {

    fill(200);

    rect(x + 10, y + CELL_SIZE - 15, CELL_SIZE - 20, 8);

    fill(50, 205, 50);

    rect(x + 10, y + CELL_SIZE - 15, (CELL_SIZE - 20) * crop.growth / 100, 8);

  }

}

function drawCity() {

  background(220);

  textSize(24);

  textAlign(CENTER);

  fill(0);

  text('🏪 Mercado da Cidade', width/2, 40);

  

  // Mostrar preços de mercado

  textSize(18);

  let y = 80;

  for (const [item, data] of Object.entries(inventory)) {

    if (data.quantity > 0) {

      const price = marketPrices[item] || data.price;

      const total = price * data.quantity;

      text(`${data.emoji} ${item}: ${data.quantity} x R$ ${price} = R$ ${total}`, width/2, y);

      y += 30;

    }

  }

  

  // Botão de vender tudo (posição dinâmica baseada no conteúdo)

  sellButtonY = y + 20; // Armazena a posição Y para verificação de clique

  fill(50, 205, 50);

  rect(width/2 - 100, sellButtonY, 200, 40, 10);

  fill(255);

  textSize(16);

  textAlign(CENTER, CENTER);

  text('Vender Tudo', width/2, sellButtonY + 20);

}

function mousePressed() {

  if (gameWon) {

    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&

        mouseY > height/2 + 100 && mouseY < height/2 + 150) {

      resetGame();

    }

    return;

  }

  

  if (currentState === GAME_STATES.FARM) {

    handleFarmClick();

  } else {

    handleCityClick();

  }

}

function handleFarmClick() {

  for (let row = 0; row < FIELD_ROWS; row++) {

    for (let col = 0; col < FIELD_COLS; col++) {

      const x = FIELD_X + col * CELL_SIZE;

      const y = FIELD_Y + row * CELL_SIZE;

      

      if (mouseX > x && mouseX < x + CELL_SIZE &&

          mouseY > y && mouseY < y + CELL_SIZE) {

        

        if (selectedTool === 'plant') {

          plantCrop(row, col);

        } else if (selectedTool === 'harvest') {

          harvestCrop(row, col);

        }

        return;

      }

    }

  }

}

function plantCrop(row, col) {

  // Verificar se já existe um cultivo

  const existingCrop = crops.find(c => c.row === row && c.col === col);

  if (existingCrop) {

    showTooltip('Já existe um cultivo aqui!');

    return;

  }

  

  // Selecionar aleatoriamente um tipo de cultivo

  const cropTypes = Object.keys(inventory);

  const randomType = cropTypes[Math.floor(Math.random() * cropTypes.length)];

  

  // Adicionar novo cultivo

  crops.push({

    row,

    col,

    type: randomType,

    growth: 0

  });

  

  showTooltip(`Plantado ${randomType} com sucesso!`);

  selectedTool = null;

}

function harvestCrop(row, col) {

  const cropIndex = crops.findIndex(c => c.row === row && c.col === col);

  

  if (cropIndex === -1) {

    showTooltip('Não há cultivo aqui para colher!');

    return;

  }

  

  const crop = crops[cropIndex];

  

  if (crop.growth < 100) {

    showTooltip('Este cultivo ainda não está pronto!');

    return;

  }

  

  // Adicionar ao inventário

  inventory[crop.type].quantity++;

  crops.splice(cropIndex, 1);

  

  showTooltip(`Colhido ${crop.type} com sucesso!`);

  selectedTool = null;

  updateUI();

}

function handleCityClick() {

  // Verificar clique no botão "Vender Tudo"

  if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&

      mouseY > sellButtonY && mouseY < sellButtonY + 40) {

    sellAll();

  }

}

function sellAll() {

  let total = 0;

  

  for (const [item, data] of Object.entries(inventory)) {

    if (data.quantity > 0) {

      const price = marketPrices[item] || data.price;

      total += price * data.quantity;

      data.quantity = 0;

    }

  }

  

  if (total > 0) {

    money += total;

    reputation += 2;

    if (reputation > 100) reputation = 100;

    showTooltip(`Vendido tudo por R$ ${total}! +2% reputação`);

  } else {

    showTooltip('Nada para vender no inventário!');

  }

  

  updateUI();

}

function toggleCity() {

  if (currentState === GAME_STATES.FARM) {

    currentState = GAME_STATES.CITY;

    document.getElementById('sell-btn').textContent = '🏡 Voltar para Fazenda';

  } else {

    currentState = GAME_STATES.FARM;

    document.getElementById('sell-btn').textContent = '🏙️ Ir para Cidade';

  }

}

function nextDay() {

  day++;

  

  // Atualizar cultivos

  crops.forEach(crop => {

    if (crop.growth < 100) {

      crop.growth += 10 + Math.floor(Math.random() * 10);

      if (crop.growth > 100) crop.growth = 100;

    }

  });

  

  // Atualizar preços de mercado

  updateMarketPrices();

  

  // Verificar vitória

  if (money >= 10000 && !gameWon) {

    gameWon = true;

    // Bônus por concluir rápido

    if (day < 50) reputation += 10;

    if (day < 30) reputation += 10;

    if (reputation > 100) reputation = 100;

  }

  

  updateUI();

}

function updateMarketPrices() {

  for (const item of Object.keys(inventory)) {

    // Preços variam aleatoriamente entre 80% e 120% do preço base

    const variation = 0.8 + Math.random() * 0.4;

    marketPrices[item] = Math.round(inventory[item].price * variation);

  }

}

function updateUI() {

  document.getElementById('money').textContent = `R$ ${money}`;

  document.getElementById('day').textContent = day;

  document.getElementById('reputation').textContent = `${reputation}%`;

  

  // Atualizar inventário

  let inventoryHTML = '';

  for (const [item, data] of Object.entries(inventory)) {

    if (data.quantity > 0) {

      inventoryHTML += `<div>${data.emoji} ${item}: ${data.quantity}</div>`;

    }

  }

  document.getElementById('inventory-items').innerHTML = inventoryHTML;

}

function showTooltip(message) {

  tooltip.message = message;

  tooltip.visible = true;

  setTimeout(() => {

    tooltip.visible = false;

  }, 2000);

}

function drawTooltip() {

  const padding = 20;

  const tooltipWidth = textWidth(tooltip.message) + padding * 2;

  

  fill(0, 0, 0, 200);

  rect(width/2 - tooltipWidth/2, 30, tooltipWidth, 40, 5);

  

  fill(255);

  textSize(16);

  textAlign(CENTER, CENTER);

  text(tooltip.message, width/2, 50);

}

function displayWinScreen() {

  background(34, 139, 34);

  fill(255);

  textSize(32);

  textAlign(CENTER, CENTER);

  text('🎉 Meta Concluída! 🎉', width/2, height/2 - 60);

  

  textSize(24);

  text('Você se tornou um mestre agricultor!', width/2, height/2 - 20);

  text(`Dias jogados: ${day}`, width/2, height/2 + 20);

  text(`Reputação final: ${reputation}%`, width/2, height/2 + 50);

  

  // Botão para reiniciar

  fill(255, 215, 0);

  rect(width/2 - 100, height/2 + 100, 200, 50, 10);

  fill(0);

  textSize(20);

  text('Jogar Novamente', width/2, height/2 + 125);

}

function resetGame() {

  money = 100;

  day = 1;

  reputation = 50;

  selectedTool = null;

  crops = [];

  

  // Resetar inventário

  for (const item of Object.keys(inventory)) {

    inventory[item].quantity = 0;

  }

  

  gameWon = false;

  updateMarketPrices();

  updateUI();

}