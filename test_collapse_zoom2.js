//TODO: fisheye for rollovers
//TODO: collapse all into 1 sentence if no branches
//TODO: make search work
//TODO: add pre selected search terms
//TODO: add retaurant list?
//TODO: add reverse tree

var global = {
	data:null,
	searchTerm:"tamarind"
}
var topLevelDictionary = {};

$(function() {
	// Window has loaded
	queue()
		.defer(d3.text, csv)
		//.defer(d3.text, csv2)
		
		.await(dataDidLoad);
})
function dataDidLoad(error, data1, data2) {
	global.data1 = data1
	//global.data2 = data2
	rightDictionary = {}
	leftDictionary = {}
	UpdateAll(global.searchTerm)
	//drawLeftChart(convertTree(leftDictionary)[0])
	
	//filterTree(convertTree(dictionary1)[0])
//	formatMenuIntoSentences(global.data2.toLowerCase(), global.searchTerm, dictionary2)
//	drawChart(convertTree(dictionary2)[0],treesvg2)

	frm1.searchTerm.value = ""
}

//TODO: expand all

//function displayResults(){
//	var displaystring = JSON.stringify(convertTree(topLevelDictionary)[0], null, 2)
//	d3.select("#output").html("<span style=\"color:red\">Showing results for: "+global.searchTerm+"</span></br></br><pre>"+displaystring+"</pre>")
//	
//}
function UpdateAll(enteredTerm){
	formatMenuIntoSentences(global.data1.toLowerCase(), enteredTerm)
	d3.select("#tree1 svg").remove()
	joinOnlyChildren(convertTree(rightDictionary)[0])
    var baseSvg = d3.select("#tree1").append("svg")
	var baseGroup = baseSvg.append("g")
	var rightGroup = baseGroup.append("g")
	var leftGroup = baseGroup.append("g")
	
	var rightData = convertTree(rightDictionary)[0]
	var leftData = convertTree(leftDictionary)[0]
	
	//drawChart(treeData, baseSvg, svgGroup, side)
	drawChart(rightData, baseSvg, baseGroup, "right")
	drawChart(leftData, baseSvg, baseGroup, "left")
	
	frm1.searchTerm.value = ""
	rightDictionary = {}
	leftDictionary = {}
}

function searchFor() {
    //document.getElementById("frm1").submit();
	d3.select("#output").html("")
	//console.log("searched for", enteredTerm)
	if(frm1.searchTerm.value != ""){
		UpdateAll(frm1.searchTerm.value)
	}
}

document.onkeydown=function(){
    if(window.event.keyCode=='13'){
        searchFor();
    }
}

var restOfWords=null;

function formatMenuIntoSentences(input, searchTerm){
	//console.log(input)
	var sentences = input.split(/\.\s*/g).map(function(sentence){return sentence.split(/\s+/g);});
	//console.log(sentences)
	for (var i =0; i < sentences.length; i++) {
	    if(searchStringInArray(searchTerm, sentences[i]) > 0){
			if(sentences[i].length > 3 ){
				var wordIndex = searchStringInArray(searchTerm, sentences[i])
				var rightSentence = sentences[i].slice(wordIndex, sentences[i].length)
				var leftSentence = sentences[i].slice(0, wordIndex+1)
				//console.log(leftSentence)
				
				var leftSentence = leftSentence.reverse()
				//console.log(leftSentence)
		  	  	insertWords(rightDictionary, rightSentence, searchTerm);
				if(leftSentence.length<30){
				insertWords(leftDictionary, leftSentence, searchTerm)
			}
			}
		}
	}	
}

function insertWords(dictionary, words, searchTerm) {
  if (words.length === 0) {
    return;
  }
  
  
  var searchTermIndex = searchStringInArray(searchTerm, words)	  
  var firstWord = words[searchTermIndex].toLowerCase();
  restOfWords = words.slice(searchTermIndex+1);
  

  var entry = dictionary[firstWord];
  if (!entry) {
   	dictionary[firstWord] = {};
    entry = dictionary[firstWord];
  }
  insertWords(entry, restOfWords);
  
 // if(restOfWords.length > 2){
 //	  insertWords(entry, restOfWords);
 // }else{
 //	dictionary[restOfWords] = {}  
 // 	entry = dictionary[restOfWords];
 // }
  
}

//TODO: make word match, not string match
//function searchStringInArray (str, strArray) {
//    var result = strArray.indexOf(str)
//	console.log(result)
//	return result
//}

function searchStringInArray (str, strArray) {
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}
function convertTree(dictionary){
	return Object.keys(dictionary).map(function(key){
		var output = {
			name: key,
			children: convertTree(dictionary[key])
		};
		var count = 0;
		var sibling = 0;
		for (var i=0; i<output.children.length; i++){
			//console.log(output.children[i].count)
			count += output.children[i].count + 1;
			if(output.children[i].count>0){
				sibling +=1
			}
		}
		output.count = count;
		output.sibling = sibling
		return output;
	});
}

function joinOnlyChildren(dictionary){
	for(var i =0; i < dictionary.children.length; i++){
		console.log(dictionary.children[i].sibling, dictionary.children[i].count)
		if(dictionary.children[i].sibling ==0 && dictionary.children[i].count ==1){
			dictionary.children[i].name = dictionary.children[i].name +" "+ dictionary.children[i].children[0].name
			delete dictionary.children[i].children
		}
	}
	console.log(dictionary)
	return dictionary
}
/////DRAWING BELOW
var width = 5000
var height =1200
//	drawChart(rightData, baseSvg, rightGroup, "right")


	//attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	function drawChart(treeData, baseSvg, subGroup, side) {
		// Calculate total nodes, max label length
		    var totalNodes = 0;
		    var maxLabelLength = 0;
		    // variables for drag/drop
		    var selectedNode = null;
		    var draggingNode = null;
		    // panning variables
		    var panSpeed = 200;
		    var panBoundary = 20; // Within 20px from edges will pan when dragging.
		    // Misc. variables
		    var i = 0;
		    var duration = 750;
		    var root;
			var rootLeft;
		
		    // size of the diagram
		    var viewerWidth = $(document).width();
		    var viewerHeight = $(document).height();

		    var tree = d3.layout.tree()
		        .size([viewerHeight, viewerWidth]);

		    // define a d3 diagonal projection for use by the node paths later on.
	   
			if(side == "right"){
			    var diagonal = d3.svg.diagonal()
			        .projection(function(d) {
			            return [d.y, d.x];
			        });
			}else{
			    var diagonal = d3.svg.diagonal()
			        .projection(function(d) {
			            return [-d.y, d.x];
			        });
			}
	   
		    // A recursive helper function for performing some setup by walking through all nodes

		    function visit(parent, visitFn, childrenFn) {
		        if (!parent) return;

		        visitFn(parent);

		        var children = childrenFn(parent);
		        if (children) {
		            var count = children.length;
		            for (var i = 0; i < count; i++) {
		                visit(children[i], visitFn, childrenFn);
		            }
		        }
		    }

		    // Call visit function to establish maxLabelLength
		    visit(treeData, function(d) {
		        totalNodes++;
		        maxLabelLength = Math.max(d.name.length, maxLabelLength);

		    }, function(d) {
		        return d.children && d.children.length > 0 ? d.children : null;
		    });
		

		    // sort the tree according to the node names
			// sort tree according to node count
		    function sortTree() {
		        tree.sort(function(a, b) {
		            return b.sibling > a.sibling ? 1 : -1;
		        });
		    }
		    // Sort the tree initially incase the JSON isn't in a sorted order.
		    sortTree();
		    // TODO: Pan function, can be better implemented.

		    function pan(domNode, direction) {
		        var speed = panSpeed;
		        if (panTimer) {
		            clearTimeout(panTimer);
		            translateCoords = d3.transform(svgGroup.attr("transform"));
		            if (direction == 'left' || direction == 'right') {
		                translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
		                translateY = translateCoords.translate[1];
		            } else if (direction == 'up' || direction == 'down') {
		                translateX = translateCoords.translate[0];
		                translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
		            }
		            scaleX = translateCoords.scale[0];
		            scaleY = translateCoords.scale[1];
		            scale = zoomListener.scale();
		            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
		            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
		            zoomListener.scale(zoomListener.scale());
		            zoomListener.translate([translateX, translateY]);
		            panTimer = setTimeout(function() {
		                pan(domNode, speed, direction);
		            }, 50);
		        }
		    }

		    // Define the zoom function for the zoomable tree

		    function zoom() {
		        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
		    }


		    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
		    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

		    function initiateDrag(d, domNode) {
		        draggingNode = d;
		        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
		        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
		        d3.select(domNode).attr('class', 'node activeDrag');

		        svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
		            if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
		            else return -1; // a is the hovered element, bring "a" to the front
		        });
		        // if nodes has children, remove the links and nodes
		        if (nodes.length > 1) {
		            // remove link paths
		            links = tree.links(nodes);
		            nodePaths = svgGroup.selectAll("path.link")
		                .data(links, function(d) {
		                    //return d.target.id;
							return d.target.id || d.source.right?diagonalRight(d):diagonalLeft(d);
		                }).remove();
		            // remove child nodes
		            nodesExit = svgGroup.selectAll("g.node")
		                .data(nodes, function(d) {
		                    return d.id;
		                }).filter(function(d, i) {
		                    if (d.id == draggingNode.id) {
		                        return false;
		                    }
		                    return true;
		                }).remove();
		        }

		        // remove parent link
		        parentLink = tree.links(tree.nodes(draggingNode.parent));
		        svgGroup.selectAll('path.link').filter(function(d, i) {
		            if (d.target.id == draggingNode.id) {
		                return true;
		            }
		            return false;
		        }).remove();

		        dragStarted = null;
		    }

		    // define the baseSvg, attaching a class for styling and the zoomListener
		        baseSvg.attr("width", viewerWidth)
		        .attr("height", viewerHeight)
		        .attr("class", "overlay")
		        .call(zoomListener);


		    // Define the drag listeners for drag/drop behaviour of nodes.
		    dragListener = d3.behavior.drag()
		        .on("dragstart", function(d) {
		            if (d == root) {
		                return;
		            }
		            dragStarted = true;
		            nodes = tree.nodes(d);
		            d3.event.sourceEvent.stopPropagation();
		            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
		        })
		        .on("drag", function(d) {
		            if (d == root) {
		                return;
		            }
		            if (dragStarted) {
		                domNode = this;
		                initiateDrag(d, domNode);
		            }

		            // get coords of mouseEvent relative to svg container to allow for panning
		            relCoords = d3.mouse($('svg').get(0));
		            if (relCoords[0] < panBoundary) {
		                panTimer = true;
		                pan(this, 'left');
		            } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

		                panTimer = true;
		                pan(this, 'right');
		            } else if (relCoords[1] < panBoundary) {
		                panTimer = true;
		                pan(this, 'up');
		            } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
		                panTimer = true;
		                pan(this, 'down');
		            } else {
		                try {
		                    clearTimeout(panTimer);
		                } catch (e) {

		                }
		            }

		            d.x0 += d3.event.dy;
		            d.y0 += d3.event.dx;
		            var node = d3.select(this);
		            node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
		            updateTempConnector();
		        }).on("dragend", function(d) {
		            if (d == root) {
		                return;
		            }
		            domNode = this;
		            if (selectedNode) {
		                // now remove the element from the parent, and insert it into the new elements children
		                var index = draggingNode.parent.children.indexOf(draggingNode);
		                if (index > -1) {
		                    draggingNode.parent.children.splice(index, 1);
		                }
		                if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
		                    if (typeof selectedNode.children !== 'undefined') {
		                        selectedNode.children.push(draggingNode);
		                    } else {
		                        selectedNode._children.push(draggingNode);
		                    }
		                } else {
		                    selectedNode.children = [];
		                    selectedNode.children.push(draggingNode);
		                }
		                // Make sure that the node being added to is expanded so user can see added node is correctly moved
		                expand(selectedNode);
		                sortTree();
		                endDrag();
		            } else {
		                endDrag();
		            }
		        });

		    function endDrag() {
		        selectedNode = null;
		        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
		        d3.select(domNode).attr('class', 'node');
		        // now restore the mouseover event or we won't be able to drag a 2nd time
		        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
		        updateTempConnector();
		        if (draggingNode !== null) {
		            update(root);
		            centerNode(draggingNode);
		            draggingNode = null;
		        }
		    }

		    // Helper functions for collapsing and expanding nodes.

		    function collapse(d) {
		        if (d.children) {
		            d._children = d.children;
		            d._children.forEach(collapse);
		            d.children = null;
		        }
		    }

		    function expand(d) {
		        if (d._children) {
		            d.children = d._children;
		            d.children.forEach(expand);
		            d._children = null;
		        }
		    }

		    var overCircle = function(d) {
		        selectedNode = d;
		        updateTempConnector();
		    };
		    var outCircle = function(d) {
		        selectedNode = null;
		        updateTempConnector();
		    };

		    // Function to update the temporary connector indicating dragging affiliation
		    var updateTempConnector = function() {
		        var data = [];
		        if (draggingNode !== null && selectedNode !== null) {
		            // have to flip the source coordinates since we did this for the existing connectors on the original tree
		            data = [{
		                source: {
		                    x: selectedNode.y0,
		                    y: selectedNode.x0
		                },
		                target: {
		                    x: draggingNode.y0,
		                    y: draggingNode.x0
		                }
		            }];
		        }
		        var link = svgGroup.selectAll(".templink").data(data);

		        link.enter().append("path")
		            .attr("class", "templink")
		            .attr("d", d3.svg.diagonal())
		            .attr('pointer-events', 'none');
				
	
				
		        link.attr("d", d3.svg.diagonal());

		        link.exit().remove();
		    };

		    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

		    function centerNode(source) {
		        scale = zoomListener.scale();
		        x = -source.y0;
		        y = -source.x0;
		        x = x * scale + viewerWidth / 2;
		        y = y * scale + viewerHeight / 2;
		        d3.select('g').transition()
		            .duration(duration)
		            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
		        zoomListener.scale(scale);
		        zoomListener.translate([x, y]);
		    }

		    // Toggle children function

		    function toggleChildren(d) {
		        if (d.children) {
		            d._children = d.children;
		            d.children = null;
		        } else if (d._children) {
		            d.children = d._children;
		            d._children = null;
		        }
		        return d;
		    }

		    // Toggle children on click.

		    function click(d) {
		        if (d3.event.defaultPrevented) return; // click suppressed
		        d = toggleChildren(d);
		        update(d);
		        centerNode(d);
		    }

		    function update(source) {
		        // Compute the new height, function counts total children of root node and sets tree height accordingly.
		        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
		        // This makes the layout more consistent.
		        var levelWidth = [1];
		        var childCount = function(level, n) {

		            if (n.children && n.children.length > 0) {
		                if (levelWidth.length <= level + 1) levelWidth.push(0);

		                levelWidth[level + 1] += n.children.length;
		                n.children.forEach(function(d) {
		                    childCount(level + 1, d);
		                });
		            }
		        };
		        childCount(0, root);
		        var newHeight = d3.max(levelWidth) * 14; // 25 pixels per line  
		        tree = tree.size([newHeight, viewerWidth]);

		        // Compute the new tree layout.
		        var nodes = tree.nodes(root).reverse(),
		            links = tree.links(nodes);

		        // Set widths between levels based on maxLabelLength.
		        nodes.forEach(function(d) {
					console.log(d.name.length)
		            d.y = (d.depth * (maxLabelLength * 7)); //maxLabelLength * 10px
		            // alternatively to keep a fixed scale one can set a fixed depth per level
		            // Normalize for fixed-depth by commenting out below line
		            // d.y = (d.depth * 500); //500px per level.
		        });

		        // Update the nodes…
		        node = svgGroup.selectAll("g.node")
		            .data(nodes, function(d) {
		                return d.id || (d.id = ++i);
		            });

		        // Enter any new nodes at the parent's previous position.
		        var nodeEnter = node.enter().append("g")
		            .call(dragListener)
		            .attr("class", "node")
		            .attr("transform", function(d) {
		                return "translate(" + source.y0 + "," + source.x0 + ")";
		            })
		            .on('click', click);

		        nodeEnter.append("circle")
		            .attr('class', 'nodeCircle')
		            .attr("r", 0)
		            .style("fill", function(d) {
		                return d._children ? "lightsteelblue" : "#fff";
		            });

		        nodeEnter.append("text")
		            .attr("x", function(d) {
		                return d.children || d._children ? -10 : 10;
		            })
		            .attr("dy", ".35em")
		            .attr('class', 'nodeText')
		            .attr("text-anchor", function(d) {
		                return d.children || d._children ? "end" : "start";
		            })
		            .text(function(d) {
		                return d.name;
		            })
		            .style("fill-opacity", 0);

		        // phantom node to give us mouseover in a radius around it
		        nodeEnter.append("circle")
		            .attr('class', 'ghostCircle')
		            .attr("r", 0)
		            .attr("opacity", 0.1) // change this to zero to hide the target area
		        .style("fill", "red")
		            .attr('pointer-events', 'mouseover')
		            .on("mouseover", function(node) {
		                overCircle(node);
		            })
		            .on("mouseout", function(node) {
		                outCircle(node);
		            });

		        // Update the text to reflect whether node has children or not.
		        node.select('text')
		            .attr("x", function(d) {
		                return d.children || d._children ? -4 : 4;
		            })
		            .attr("text-anchor", function(d) {
		                return d.children || d._children ? "end" : "start";
		            })
		            .text(function(d) {
		                return d.name;
		            });

		        // Change the circle fill depending on whether it has children and is collapsed
		        node.select("circle.nodeCircle")
		            .attr("r", 0)
		            .style("fill", function(d) {
		                return d._children ? "lightsteelblue" : "#fff";
		            });

		        // Transition nodes to their new position.
		        var nodeUpdate = node.transition()
		            .duration(duration)
		            .attr("transform", function(d) {
						if(side == "left"){
			                return "translate(" + "-"+d.y + "," + d.x + ")";
						
						}else if (side == "right"){
			                return "translate(" + d.y + "," + d.x + ")";
						}
		            });

		        // Fade the text in
		        nodeUpdate.select("text")
		            .style("fill-opacity", 1);

		        // Transition exiting nodes to the parent's new position.
		        var nodeExit = node.exit().transition()
		            .duration(duration)
		            .attr("transform", function(d) {
		                return "translate(" + source.y + "," + source.x + ")";
		            })
		            .remove();

		        nodeExit.select("circle")
		            .attr("r", 0);

		        nodeExit.select("text")
		            .style("fill-opacity", 0);

		        // Update the links…
		        var link = svgGroup.selectAll("path.link")
		            .data(links, function(d) {
		                return d.target.id;
		            });

		        // Enter any new links at the parent's previous position.
		        link.enter().insert("path", "g")
		            .attr("class", "link")
		            .attr("d", function(d) {
		                var o = {
		                    x: source.x0,
		                    y: source.y0
		                };
		                return diagonal({
		                    source: o,
		                    target: o
		                });
		            });

		        // Transition links to their new position.
		        link.transition()
		            .duration(duration)
		            .attr("d", diagonal);

		        // Transition exiting nodes to the parent's new position.
		        link.exit().transition()
		            .duration(duration)
		            .attr("d", function(d) {
		                var o = {
		                    x: source.x,
		                    y: source.y
		                };
		                return diagonal({
		                    source: o,
		                    target: o
		                });
		            })
		            .remove();

		        // Stash the old positions for transition.
		        nodes.forEach(function(d) {
					d.x0 = d.x;
					d.y0 = d.y;
		        });
		    }

		    // Append a group which holds all nodes and which the zoom Listener can act upon.
		    var svgGroup = subGroup.append("g");

		    // Define the root
		    root = treeData;
		    root.x0 = viewerHeight / 2;
		    root.y0 = 0;

		    // Layout the tree initially and center on the root node.
		    update(root);
		    centerNode(root);
	}	

	//console.log(JSON.stringify(topLevelDictionary, null, 2));

	//console.log(JSON.stringify(topLevelDictionary, null, 2));
