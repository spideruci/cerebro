var color = d3.scale.category10();

var width = document.getElementsByTagName("body")[0].offsetWidth,
    height = 720;




var force = d3.layout.force().size([width, height]);

var svg = d3.select("body").append("div").style("height", "80vh").append("svg")
    // .attr("width", width)
    // .attr("height", height)
    // .style("background-color", "black")
    .attr("pointer-events", "all")
    .call(d3.behavior.zoom().on("zoom", redraw))
    ;

var vis = svg.append('svg:g');

function redraw() { 
  if(should_transform) {
    translate_x = d3.event.translate[0];
    translate_y = d3.event.translate[1];
    vis.attr("transform",
      "translate(" + d3.event.translate + ")"
      + " scale(" + d3.event.scale + ")");  
  } else {
    if(translate_y == null || translate_x == null) {
      translate_x = width/4;
      translate_y = height/4;
    }
    vis.attr("transform",
      "translate(" + translate_x + "," + translate_y + ")"
      + " scale(" + d3.event.scale + ")");    
  }
}

var start = new Date().getTime();
var time = 0;
var trace = null;
var traces;
var traces_pointer;
var ddg_nodes;
var ddg_links;
var should_transform = true;
var translate_x = null;
var translate_y = null;
var dict = [];
var method_dict = [];
var maxDistance = 0;
var max_wt = 1;
var lasso;

d3.json("brains/nanoxml3.json", function(error, graph) {
  traces = graph.traces;
  traces_pointer = 0;
  ddg_nodes = graph.nodes;
  ddg_links = graph.links;
  var slider_element = document.getElementsByName("slider")[0];
  slider_element.max = traces[traces_pointer].size;

  ddg_links.forEach(function(element) {
    var wt = element.value;
    if(max_wt < wt) {
      max_wt = wt;
    }
  });

  force.nodes(graph.nodes)
       .links(graph.links);

  var links = vis.selectAll(".link")
              .data(graph.links)
              .enter().append("line")
              .attr("class", "link")
              .attr("content", function(d) {return d.value;})
              .style("stroke-width", function(d) { return plateau(d.value); })
              ;

  var toY = function(currentNode) { return currentNode.y }

  var toX = function(currentNode) { return currentNode.x }

  var toMax = function(previous_max, current) {
      if(current > previous_max) return current;
      return previous_max;
  }

  var toMin = function(previous_min, current) {
      if(current < previous_min) return current;
      return previous_min;
  }

  var nodes_x_max = 
    graph.nodes.map(toX).reduce(toMax, Number.NEGATIVE_INFINITY);

  var nodes_x_min = 
    graph.nodes.map(toX).reduce(toMin, Number.POSITIVE_INFINITY);

  var x_scale = d3.scale.linear()
    .range([nodes_x_min - 20, nodes_x_max + 20]);

  var nodes_y_max = 
    graph.nodes.map(toY).reduce(toMax, Number.NEGATIVE_INFINITY);

  var nodes_y_min = 
    graph.nodes.map(toY).reduce(toMin, Number.POSITIVE_INFINITY);

  var y_scale = d3.scale.linear()
    .range([nodes_y_min - 20, nodes_y_max + 20]);

  // Create the area where the lasso event can be triggered
  var lasso_area = vis.append("rect")
                      .attr("x", nodes_x_min)
                      .attr("y", nodes_y_min)
                      .attr("width", nodes_x_max - nodes_x_min)
                      .attr("height", nodes_y_max - nodes_y_min)
                      // .style("opacity",0);
                      .style("visibility", "visible")
                      .style("stroke", "pink")
                      .style("fill", "lightgrey")
                      .style("fill-opacity", 0.05)
                      .style("stroke-width", "2px");

  // Define the lasso
  lasso = d3.lasso()
        .closePathDistance(75) // max distance for the lasso loop to be closed
        .closePathSelect(true) // can items be selected by closing the path?
        .hoverSelect(false) // can items by selected by hovering over them?
        .area(lasso_area) // area where the lasso can be started
        .on("start",lasso_start) // lasso start function
        .on("draw",lasso_draw) // lasso draw function
        .on("end",lasso_end) // lasso end function
        .scales(x_scale, y_scale);

  // Init the lasso on the svg:g that contains the dots
  vis.call(lasso);

  d3.select("rect.background").append("title").text("Selection Mode")
  
  var node = vis.selectAll(".node")
              .data(graph.nodes)
              .enter().append("circle")
              .attr("class", "node")
              .attr("r", 5)
              .style("fill", function(d) { return color(d.colorGroup); })
              .attr("content", function(d) { return get_instruction_info(d); });

  var exec_options = d3.select("select").selectAll("option")
                        .data(graph.traces)
                        .enter().append("option")
                        .attr("value", function(d, i) {return i;})
                        .text(function(d) {return d.name;})
                        ;

  node.append("title")
      .text(function(d) { return get_instruction_info(d); });

  lasso.items(d3.selectAll(".node"));

  console.log("nodes completed");

  magic(links, node, width, height);

});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var magic = function(links, node, max_width, max_height) {
  var random_x1 = getRandomInt(0, max_width);
  var random_y1 = getRandomInt(0, max_height);
  
  links.attr("x1", function(d) { return d.x1; })
        .attr("y1", function(d) { return d.y1; })
        .attr("x2", function(d) { return d.x2; })
        .attr("y2", function(d) { return d.y2; }); 
      node.attr("cx", function(d) { return d.x })
          .attr("cy", function(d) { return d.y });
      var end = new Date().getTime();
      time = end - start;
      console.log(time);
      time = time / 1000;
      document.getElementsByName("state")[0].value = "loading completed in ... "
      document.getElementById("timeview").innerHTML = time.toString() + " seconds."
      for(var i = 0; i < document.getElementsByTagName("button").length; i += 1) {
        document.getElementsByTagName("button")[i].disabled = false  
      }
}

var pause = function() {
  var playstate = document.getElementsByName("playstate")[0];
  playstate.innerHTML = "Paused";
  var slider = document.getElementsByName("slider")[0];
  slider.step = 0;
}

var resume = function() {
  var playstate = document.getElementsByName("playstate")[0];
  playstate.innerHTML = "Playing";
  var slider = document.getElementsByName("slider")[0];
  slider.step = 1; 
}

var slider_delay = 1;
var timerCallBack = function() {
  var slider = document.getElementsByName("slider")[0];
  var length = traces[traces_pointer].size;
  var count = parseInt(slider.value);
  var step = parseInt(slider.step);
  slider.value = count + step;
  slider.onchange();
  
  if(slider.value < length) {
    setTimeout(timerCallBack, slider_delay);
  }
}

var blink3 = function() {
  var playstate = document.getElementsByName("playstate")[0];
  playstate.innerHTML = "Fetching Trace";
  var trace_name = traces[traces_pointer].name;

  d3.json("traces/nanoxml/" + trace_name + ".json", function(error, json) {
    if (error) return console.warn(error);
    trace = json;
    playstate.innerHTML = "Playing";
    var slider = document.getElementsByName("slider")[0];
    slider.value = 1;
    timerCallBack();
  });
  
}

var slowdown = function(value) {
  slider_delay = 1 * parseInt(value);
  var slowdownvalue = document.getElementsByName("slowdownvalue")[0];
  slowdownvalue.innerHTML = slider_delay;
}

var slide = function(value) {
  var nodes = vis.selectAll(".node");
  var length = traces[traces_pointer].size;
  var step_size = 1;
  var playback_delay = 10;
  var counter = value;
  var counter2 = 0;
  node = nodes[0][trace[counter]]
  t00 = d3.select(node).transition().duration(10);
  t00.delay(function(d, j) { return (50) + (playback_delay); })
  .each("end", function() {
    counter2 = value;
    
    if(counter2 * step_size < length) {
      var curr_insn_div = document.getElementsByName("curr_insn")[0];
      var find = '\n';
      var re = new RegExp(find, 'g');
      curr_insn_div.innerHTML = get_instruction_info(ddg_nodes[trace[counter2 * step_size]]).replace(re, "<br/>"); 
    }

    if(value >= length - 50) {
      document.getElementsByTagName("button")[3].disabled = false;
    }
  })
  .attr("r", "10")
  .style("fill", "white");

  var t11 = t00.transition().duration(10);
  t11.delay(function(d, k) { return (50) + 500  + (playback_delay); })
  .each("end", function() {

  })
  .attr("r", "5")
  .style("fill", function(d) { return color(d.colorGroup); });
}

var get_instruction_info = function(insn) {
  var str_temp = "";
  str_temp += "Line: " + insn.lineNum + ",";
  str_temp += "\nMethod: " + insn.methodName + ",";
  str_temp += "\nClass: " + insn.className + ",";
  str_temp += "\nSource Code Line: " + "[missing data]";
  return str_temp;
}

var toggle_edges = function() {
  if(vis.select(".link").style("visibility") === "visible") {
    vis.selectAll(".link")
      .attr("visibility", "hidden");  
  } else {
    vis.selectAll(".link")
      .attr("visibility", "visible");  
  } 
}

var remove_edge_weights = function() {
  var links = vis.selectAll(".link")[0];
  for(var i = 0 ; i < links.length; i += 1) {
    links[i].style.strokeWidth = 2 + "px";
  }
}

var add_edge_weights = function() {
  var links = vis.selectAll(".link")[0];
  var max = -1;
  for(var i = 0 ; i < links.length; i += 1) {
    var width =parseInt(links[i].getAttribute("content"));
    if(width > max) max = width;
    links[i].style.strokeWidth = plateau(width)  + "px";
  }
  console.log(max);
}

var plateau = function(value) {
  var r = 50;
  var x = r * (value/max_wt);
  var y = Math.sqrt((x*x) + (x*r*2))
  return y;
}

var change_execution = function(value) {
  document.getElementsByTagName("button")[3].disabled = false;
  console.log(value)
  traces_pointer = value;
  console.log(traces_pointer)
  var slider_element = document.getElementsByName("slider")[0];
  slider_element.max = traces[traces_pointer].size;
  slider_element.value = slider_element.min;
  trace = null;
}

var lock_transformation = function(checkbox) {
  if(checkbox.checked) {
    should_transform = false;
  } else {
    should_transform = true;
  }
}

var put_classname_in_dict = function(text) {
  var start = text.indexOf("Class:");
  var end = text.indexOf("\nSource Code Line:");
  if(start == -1 || end == -1) return false;
  sub = text.substring(start, end);
  var contains = false;
  var result = null;
  for(var i = 0; i < dict.length; i += 1) {
    if(dict[i].key === sub) {
      result = dict[i];
      contains = true;  
      break;
    }
  }
  if(contains) {
    if(parseInt(result.value)) {
      result.value += 1;
    } else {
      result.value = 1;
    }
  } else {
    dict[dict.length] = {key: sub, value: 1}
  }
}

var put_methodname_in_dict = function(text) {
  var start = text.indexOf("Method:");
  var end = text.indexOf("\nClass:");
  if(start == -1 || end == -1) return false;
  sub = text.substring(start, end);
  var contains = false;
  var result = null;
  for(var i = 0; i < method_dict.length; i += 1) {
    if(method_dict[i].key === sub) {
      result = method_dict[i];
      contains = true;  
      break;
    }
  }
  if(contains) {
    if(parseInt(result.value)) {
      result.value += 1;
    } else {
      result.value = 1;
    }
  } else {
    method_dict[method_dict.length] = {key: sub, value: 1}
  }
} 

function brushstart() {
  svg.classed("selected", true);
}

function brushend() {
  svg.classed("selected", !d3.event.target.empty());
}

// Lasso functions to execute while lassoing
var lasso_start = function() {
  lasso.items()
    .attr("r", 5) // reset size
    .classed({"not_possible":true,"selected":false}); // style as not possible
};

var lasso_draw = function() {
  // // Style the possible dots
  lasso.items().filter(function(d) {return d.possible===true})
    .classed({"not_possible":false,"possible":true});

  // // Style the not possible dot
  lasso.items().filter(function(d) {return d.possible===false})
    .classed({"not_possible":true,"possible":false});
};

var lasso_end = function() {
  // // Reset the color of all dots
  // lasso.items()
  //    .style("fill", function(d) { return color(d.species); });

  // // Style the selected dots
  var selection = lasso.items().filter(function(d) {return d.selected===true});
  selection.classed({"not_possible":false,"possible":false})
           .attr("r",7);

  
  // // Reset the style of the not selected dots
  lasso.items().filter(function(d) {return d.selected===false})
    .classed({"not_possible":false,"possible":false})
    .attr("r",5);
    
  activate_selection(selection[0])
};

var activate_selection = function(selected_nodes) {
  dict = [];
  method_dict = [];
  
  console.log(selected_nodes);
  for (var count = 0; count < selected_nodes.length; count += 1) {
    var temp = selected_nodes[count].getAttribute("content");
    put_classname_in_dict(temp);
    put_methodname_in_dict(temp);
  }

  var output = "";
  if(dict.length != 0) output = "<b>Classes Selected:</b> <br/>";
  for (var count2 = 0; count2 < dict.length; count2 += 1) {
    var classCount = dict[count2].value
    var count_markup = "<span class=\"badge\">" + classCount + "</span>";
    var className = dict[count2].key.substring("Class: ".length);
    var temp = count_markup + " " + className + "<br/>";

    output += temp;
  }

  document.getElementById("classlist").innerHTML = output;

  var output2 = "";
  if(method_dict.length != 0) output2 = "<b>Methods Selected:</b> <br/>";
  for (var count2 = 0; count2 < method_dict.length; count2 += 1) {
    var methodName = method_dict[count2].key.substring("Method: ".length);
    var methodCount = "<span class=\"badge\">" + method_dict[count2].value + "</span>";
    var temp = methodCount + " " + methodName + "<br/>";
    output2 += temp;
  }

  document.getElementById("methodlist").innerHTML = output2;
}