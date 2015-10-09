'use strict';
/*global _, $ */

var bigrams, trigrams;

$(document).ready(function() {
	$.get('big_bi-gram-links.json', function(data) {
		bigrams = data;
		$.get('big_tri-gram-links.json', function(data) {
			trigrams = data;
		});
	});
	$('.generate').click(function(){
		$('.sentence').val(generateSentence(
			parseInt($('.length').val()),
			parseFloat($('.k').val())
		));
	});
});

function generateSentence(length, k, dictionary, starter) {

	var current = starter || _.sample(dictionary || Object.keys(bigrams));
	var last;

	var sentence = [current];

	function dictionaryContains(word) {
		return _.contains(dictionary, word);
	}

	function getNeighbor(links, word) {
		var neighbors = links[word];
		if (dictionary) {
			neighbors = neighbors.filter(dictionaryContains);
		}
		// neighbors might be null or empty...
		var neighbor = neighbors[Math.ceil(neighbors.length * Math.random() * k)];
		// Go through all of the words if word doesnt have neighbors
		var i = 0;
		while (!_.has(links, neighbor) && i < neighbors.length) {
			neighbor = neighbors[i++];
		}
		return neighbor;
	}

	// Generate Neighbors
	_(length - 1).times(function(i) {
		var neighbor = i % 2 === 0 ? getNeighbor(bigrams, current) : getNeighbor(trigrams, last);
		last = current;
		current = neighbor;
		sentence.push(current);
	});

	return sentence.join(' ');
}