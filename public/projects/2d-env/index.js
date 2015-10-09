'use strict';

/* global _, console */

var ctx = document.getElementById('canvas').getContext('2d');

// http://www.colourlovers.com/palette/1083480/Between_The_Clouds
var skyColor = '#DEE1B6';
var soilColor = '#BD5532';
var rainColor = '#373B44';
var waterColor = '#73C8A9';

var worldWidth = 400;
var worldHeight = 200;

var baseSoilY = worldHeight - 50;
var maxRainDropWeight = 3;
var maxMoistureLevel = 10;

var soilLines = new Array(worldWidth);
var rainfall = _.times(worldWidth, function(x) {
	return new Raindrop(x);
});

var waterLevel = _.times(worldWidth, function() {
	return _.random(5);
});

console.log('Generating Soil Height Map');

binaryIteration(0, worldWidth, baseSoilY, mutateHeight, setSoilHeight);

// Improve: http://www.html5gamedevs.com/topic/8716-game-loop-fixed-timestep-variable-rendering/
function gameLoop() {
	requestAnimationFrame(gameLoop);
	//setTimeout(gameLoop, 1000);
	update();
	render();
}

function render() {
	// Background
	ctx.fillStyle = skyColor;
	ctx.fillRect(0, 0, worldWidth, worldHeight);
	// Soil
	soilLines.forEach(function(soilLine) {
		soilLine.render();
	});
	// Rainfall
	rainfall.forEach(function(raindrop) {
		raindrop.render();
	});
	//Water
	waterLevel.forEach(function(level, x) {
		ctx.fillStyle = waterColor;
		ctx.fillRect(x, soilLines[x].y, 1, -level);
	});
}

var waterSmoothRate = -0.1;
var rateAlpha = 1 + waterSmoothRate;
var rateBeta = waterSmoothRate * 0.5;

//var windVelocity = 0.5; // m/s

function waterSurfaceArea() {
	return _.reduce(waterLevel, function (sum, level) {
		return sum + level;
	}, 0);	
}

// TODO: Use local water surface ...
function waterEvaporationRate() {
	return waterSurfaceArea() * 0.002;
}

function smooth(x, i) {
	x[i] = x[i] * rateAlpha - rateBeta * (x[i - 1] + x[i + 1]);
}

function update() {
	rainfall.forEach(function(raindrop, x) {
		raindrop.update();
		var soil = soilLines[x];
		if (raindrop.y >= soil.y - waterLevel[x]) {
			waterLevel[x] += raindrop.weight;
			//soil.moisten(raindrop.weight);
			raindrop.reset();
		}
	});
	// Smooth Water
	var evaporation = waterEvaporationRate();
	for (var x = 1; x < worldWidth - 1; x++) {
		smooth(waterLevel, x);
		waterLevel[x] -= evaporation;
	}	
}

function Raindrop(x) {
	this.x = x;
	this.reset = function() {
		this.y = -_.random(worldHeight);
		this.weight = _.random(1, maxRainDropWeight);
	};
	this.update = function() {
		this.y += this.weight;
	};
	this.render = function() {
		ctx.fillStyle = rainColor;
		ctx.fillRect(this.x, this.y, 1, this.weight);
	};
	this.reset();
}

function SoilLine(x, y) {
	this.x = x;
	this.y = y;
	this.moisture = 0;
	this.render = function() {
		ctx.strokeStyle = soilColor;
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x, worldHeight);
		ctx.stroke();
	};
	this.moisten = function(amt) {
		// Soil should consume rain IF moisture < moistureLimit
		this.moisture += amt;
		if (this.moisture > maxMoistureLevel) {
			// Erode and deposit
			this.y++;
			soilLines[x + (_.random(1) ? 1 : -1)].y--;
			this.moisture = 0;
		}
	};
}

function binaryIteration(start, end, data, mutateDataFn, leafCallback) {
	if (end < start) {
		leafCallback(end, data);
	} else {
		var middle = ((start + end) / 2) | 0;
		binaryIteration(start, middle - 1, mutateDataFn(data), mutateDataFn, leafCallback);
		binaryIteration(middle + 1, end, mutateDataFn(data), mutateDataFn, leafCallback);
	}
}

function mutateHeight(height) {
	return _.random(4) ? height : height + _.random(2) - 1;
}

function setSoilHeight(x, height) {
	soilLines[x] = new SoilLine(x, height);
}

gameLoop();