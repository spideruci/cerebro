var socket = io.connect();

socket.emit('client message', {'text': 'Hello from the client!!'});
socket.on('server message', function(message) {
  console.log(message.text);
});

var node_id_stream = [];
var done = true;
socket.on('private server message', function(message) {
  d3.select('#messages').text(message.text + " " + message.msg_count);
  var node_id = parseInt(message.text);
  if(node_id != NaN && node_id != -1) {
    //node_id_stream.push(node_id);

    animate_node(node_id);

  }
});

var color_palete = function(number) {
  var colors = [];
  var jump = Math.ceil(360/number);
  if(jump < 5) jump = 5;
  for(var i = 0; i <= 360; i += jump) {
    // var s = (colors.length % 2 === 0) ? 0.4 : 0.9;
    var s = 1;
    var x = d3.hsl(i, s, 0.5);
    colors.push(x);
    if(colors.length == number) break;
  }

  console.log(colors.length + " " + number);

  if(colors.length < number) {
    var new_colors = [];
    var cycle_count = Math.floor(number / colors.length) - 1;
    var residual_element_count = number % colors.length;

    for(var i = 0; i < residual_element_count; i += 1) {
      var rev_cyc_count = cycle_count + 1;
      var color = colors[i];
      new_colors.push(color);
      var s = color.s; // should be 1.0
      for(var j = 1; j <= 4 && j <= rev_cyc_count; j += 1) {
        s = s - 0.1;
        new_colors.push(d3.hsl(color.h, s, color.l));
      }
    }

    for(var i = residual_element_count; i < colors.length; i += 1) {
      var rev_cyc_count = cycle_count;
      var color = colors[i];
      new_colors.push(color);
      var s = color.s; // should be 1.0
      for(var j = 1; j <= 4 && j <= rev_cyc_count; j += 1) {
        s = s - 0.1;
        new_colors.push(d3.hsl(color.h, s, color.l));
      }
    }
    colors = new_colors; 
  }

  console.log(colors.length);
  
  return colors;
}

var shuffle_colors = function(colors) {
  var shuffled_colors = []
  var mid = Math.floor(number / 2);
  var odd = number % 2;
  for(var i = 0; i < mid;  i += 1) {
    shuffled_colors.push(colors[i]);
    shuffled_colors.push(colors[i+ mid + odd]);
  }
  console.log(shuffled_colors.length);
  if(odd === 1) {
    shuffled_colors.push(colors[mid]);
  }
  return shuffled_colors;
}


var color_palete_hex = function(number) {
  var x = color_palete(number);
  return x.map(function(hsl) {
    return hsl.toString();
  });
};



var width = document.getElementsByTagName("body")[0].offsetWidth,
    height = 720;




var force = d3.layout.force().size([width, height]);

var svg = d3.select("body").append("div").attr("id", "vectors").style("height", "80vh").append("svg")
    .attr("pointer-events", "all")
    .call(d3.behavior.zoom().on("zoom", redraw));

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
var all_classes = [];
var color_picker;
var stop_class_color = "#444444"
var selection_count = 0;

var module_color = function(data) {
  if(data.colorGroup2 === all_classes.length) 
    return stop_class_color;
  return color_picker(data.colorGroup2);
}

var is_stop_class = function(class_name) {
  if(class_name === null 
      || class_name.length === 0
      || class_name.toLowerCase().contains("test")) {
    return true;
  }
  return false;
}

var init = function(error, graph) {
  traces = graph.traces;
  traces_pointer = 0;
  ddg_nodes = graph.nodes;
  ddg_links = graph.links;
  var slider_element = document.getElementsByName("slider")[0];
  slider_element.max = traces[traces_pointer].size;

  ddg_nodes.forEach(function(element) {
    var class_name = element.className;
    if(is_stop_class(class_name)) return;
    if(all_classes.indexOf(class_name) === -1) {
      all_classes.push(class_name);
    }
  });

  console.log(all_classes.length);
  all_classes = all_classes.sort();

  ddg_nodes.forEach(function(element) {
    var class_name = element.className;
    if(is_stop_class(class_name)) {
      element.colorGroup2 = all_classes.length;
    } else {
      element.colorGroup2 = all_classes.indexOf(class_name);
    }
  });

  color_picker = d3.scale.ordinal()
                  .domain(d3.range(all_classes.length))
                  .range(color_palete_hex(all_classes.length));

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
                      .attr("x", nodes_x_min - 20)
                      .attr("y", nodes_y_min - 20)
                      .attr("width", nodes_x_max - nodes_x_min + 40)
                      .attr("height", nodes_y_max - nodes_y_min + 40)
                      // .style("opacity",0);
                      .style("visibility", "visible")
                      .style("stroke", "pink")
                      .style("fill", "lightgrey")
                      .style("fill-opacity", 0.05)
                      .style("stroke-width", "2px");
  lasso_area.append("title").text("Selection Mode. Panning disabled.");

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
  
  var node = vis.selectAll(".node")
              .data(graph.nodes)
              .enter().append("circle")
              .attr("class", "node")
              .attr("r", 5)
              .style("fill", function(d) {
                return module_color(d);
              });

  d3.select("select#execution-selector").selectAll("option").remove();              

  var exec_options = d3.select("select#execution-selector").selectAll("option")
                        .data(graph.traces)
                        .enter().append("option")
                        .attr("value", function(d, i) {return i;})
                        .text(function(d) {return d.name;})
                        ;

  

  node.append("title")
      .text(function(d) { return d.id + "\n" + get_instruction_info(d, "\n"); });

  lasso.items(d3.selectAll(".node"));

  console.log("nodes completed");

  magic(links, node, width, height);

  remove_color();

}

var subject = "";
var initate = function(subject_name) {
  subject = subject_name;
  d3.json("brains/" + subject_name + ".json", init);
}

initate("nanoxml");

var change_subject = function(value) {
  vis.remove();
  svg.remove();

  svg = d3.select("div#vectors").append("svg")
    .attr("pointer-events", "all")
    .call(d3.behavior.zoom().on("zoom", redraw))
    ;

  vis = svg.append('svg:g');

  start = new Date().getTime();
  time = 0;
  trace = null;
  traces;
  traces_pointer;
  ddg_nodes;
  ddg_links;
  should_transform = true;
  translate_x = null;
  translate_y = null;
  dict = [];
  method_dict = [];
  maxDistance = 0;
  max_wt = 1;
  lasso;
  all_classes = [];
  color_picker;
  initate(value);
}

var magic = function(links, node, max_width, max_height) {
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
      for(var i = 0; i < document.getElementsByTagName("button").length; i += 1) {
        document.getElementsByTagName("button")[i].disabled = false  
      }
}

var playpause = function() {
  var playpause_span = document.getElementsByName("playpause")[0];
  var playpause_class = playpause_span.getAttribute("class")
  if(playpause_class === "glyphicon glyphicon-play") {
    playpause_span.setAttribute("class", "glyphicon glyphicon-pause")  
    resume();
  } else if(playpause_class === "glyphicon glyphicon-pause") {
    playpause_span.setAttribute("class", "glyphicon glyphicon-play")  
    pause();
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

var slider_delay;
var timerCallBack = function() {
  var slider = document.getElementsByName("slider")[0];
  var length = traces[traces_pointer].size;
  var count = parseInt(slider.value);
  var step = parseInt(slider.step);
  if(step != 0) {
    slider.onchange();
    slider.value = count + step;
  }
  
  if(slider.value < length) {
    setTimeout(timerCallBack, slider_delay);
  }
}

var blink3 = function() {
  var begin_execution_span = document.getElementsByName("begin_execution")[0];
  begin_execution_span.setAttribute("class", "glyphicon glyphicon-repeat");

  var playstate = document.getElementsByName("playstate")[0];
  playstate.innerHTML = "Fetching Trace";
  var trace_name = traces[traces_pointer].name;

  d3.json("traces/" + subject + "/" + trace_name + ".json", function(error, json) {
    if (error) return console.warn(error);
    trace = json;
    playstate.innerHTML = "Playing";
    var slider = document.getElementsByName("slider")[0];
    slider.max = traces[traces_pointer].size;
    slider.value = 0;
    document.getElementsByName("slowdown")[0].onchange();
    timerCallBack();
  });
}

var slowdown = function(value) {
  slider_delay = 0.001 * parseInt(value);
  var slowdownvalue = document.getElementsByName("slowdownvalue")[0];
  slowdownvalue.innerHTML = slider_delay * 1000;
}

var slide = function(value) {
  var nodes = vis.selectAll(".node");
  var length = traces[traces_pointer].size;
  var step_size = 1;
  var counter = value;
  var counter2 = 0;
  node = nodes[0][trace[counter] - 1];
  animate_node(trace[counter]);
}

var animate_node = function(node_id) {
  var nodes = vis.selectAll(".node");
  var node = nodes[0][node_id - 1];
  var insn = node.__data__;
  t00 = d3.select(node).transition().duration(1);
  t00.delay(0).each("end", function() {
    print_sourceline_on_console(insn);
  })
  .attr("r", "12.5")
  .style("fill", "white");

  var t11 = t00.transition().duration(1);
  t11.delay(500)
  .attr("r", "5")
  .style("fill", function(d) { 
    return module_color(d);
  });
}

var print_sourceline_on_console = function(insn) {
  var curr_insn_div = document.getElementsByName("curr_insn")[0];
  var find = '\n';
  var re = new RegExp('\n', 'g');
  curr_insn_div.innerHTML = get_instruction_info(insn, "<br/>");
}

var get_instruction_info = function(insn, sep) {
  var str_temp = "";
  str_temp += "Line: " + insn.lineNum + ",";
  str_temp += sep + "Method: " + insn.methodName + ",";
  str_temp += sep + "Class: " + insn.className + ",";
  str_temp += sep + "Source Code Line: " + "[missing data]";
  return str_temp;
}

function add_color() {
  d3.selectAll(".node").style("fill", 
    function(d) { 
      return module_color(d); 
    });
}

function remove_color() {
  d3.selectAll(".node").style("fill", 
    function(d) {
      if(d.colorGroup2 === all_classes.length) return stop_class_color;
      return "white"
    });
}

var toggle_edges = function() {
  if(vis.select(".link").style("visibility") === "visible") {
    vis.selectAll(".link").attr("visibility", "hidden");  
  } else {
    vis.selectAll(".link").attr("visibility", "visible");  
  } 
}

var toggle_edge_weights = function(btn) {
  var weights = btn.getAttribute("weights");
  if(weights === "0") {
    add_edge_weights();
    btn.setAttribute("weights", "1");
  } else if(weights === "1") {
    remove_edge_weights();
    btn.setAttribute("weights", "0")
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
  }

    var plateau = function(value) {
      var r = 50;
      var x = r * (value/max_wt);
      var y = Math.sqrt((x*x) + (x*r*2))
      return y;
    }

var change_execution = function(value) {
  var begin_execution_span = document.getElementsByName("begin_execution")[0];
  begin_execution_span.setAttribute("class", "glyphicon glyphicon-off");
  document.getElementsByTagName("button")[3].disabled = false;
  traces_pointer = value;
}

var lock_transformation = function(checkbox) {
  if(checkbox.checked) {
    should_transform = false;
  } else {
    should_transform = true;
  }
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
           .attr("r",10);

  
  // // Reset the style of the not selected dots
  lasso.items().filter(function(d) {return d.selected===false})
    .classed({"not_possible":false,"possible":false})
    .attr("r",5);
    
  activate_selection(selection[0])
};



var dump_selection_to_server = function(selected_nodes) {
  var selected_data = selected_nodes.map(function(element) { 
    return element.__data__.id; 
  });

  var time = Date.now();

  var message = {
    'selection' : selected_data,
    'subject' : subject, 
    'selection_count' : selection_count++, 
    'time' : time};

  var datetime = new Date();
  datetime.setTime(time);

  var log_name =
      message.subject + '.' + 
      message.time + '.' + 
      message.selection_count; 

  d3.select("#selection-history")
    .insert("option", ':first-child')
    .attr("value", log_name)
    .attr('selected', true)
    .text(message.selection_count + ") " +
      message.subject + ", time:" + 
      datetime.getHours() + ":" + datetime.getMinutes() + ":" + datetime.getSeconds());

  socket.emit('node selection', message);
}

var populate_distb_lists = function(selected_nodes) {
  var clean_type_desc = function(name) {
    var re = new RegExp("L[a-z0-9]+/", "g");
    var re2 = new RegExp("[a-z0-9]+/", "g");
    return name.replace(re, "", "g").replace(re2, "", "g");
  }

  var put_in_dict = function(name, temp_dict, color) {
    var contains = false;
    var result = null;
    for(var i = 0; i < temp_dict.length; i += 1) {
      if(temp_dict[i].key === name) {
        result = temp_dict[i];
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
      temp_dict[temp_dict.length] = {key: name, value: 1, "color": color}
    }
  }

  var populate_lists = function(list_id, list_title, dict) {

    var divs = d3.select(list_id).selectAll('div')
      .data(dict).enter().append('div');

    divs.append('span')
        .text(function(d) {return " " + d.key; });
    divs.insert('span', ':first-child')
      .attr('class', 'badge')
      .style('color', 'black')
      .style('background-color', function(d) { return d.color; })
      .text(function(d) { return d.value; });

    d3.select(list_id)
      .insert('b', ':first-child')
      .text(list_title);
  };

  dict = [];
  method_dict = [];

  d3.selectAll(selected_nodes).each(function(d, i) {
    var color = module_color(d);
    put_in_dict(d.className, dict, color);
    put_in_dict(d.methodName, method_dict, color);
  });


  dict = dict.sort(function (a, b) {
    return parseInt(b.value) - parseInt(a.value);
  });

  populate_lists('#classlist', "Selection's Class Distribution", dict)

  method_dict = method_dict.sort(function (a, b) {
    return parseInt(b.value) - parseInt(a.value);
  });

  method_dict = method_dict.map(function (element) {
    var method_name = element.key;
    method_name = 
      method_name.replace("<", "&lt;", "g").replace(">", "&gt;", "g");
    method_name = clean_type_desc(method_name).replace(',', '.');
    element.key = method_name;
    return element;
  })

  populate_lists('#methodlist', "Selection's Class Distribution", method_dict)

}

var clear_distb_lists = function() {
  d3.select('#classlist').html('');
  d3.select('#methodlist').html('');
}

var set_univ_nodes_radius = function(radius) {
  return d3.selectAll('.node').attr('r', radius);
}

var deactivate_any_selection = function() {
  clear_distb_lists();
  set_univ_nodes_radius(5);
}

var activate_selection = function(selected_nodes) {
  if(selected_nodes === null || selected_nodes.length === 0) {
    deactivate_any_selection();
    return;
  }

  dump_selection_to_server(selected_nodes);
  populate_distb_lists(selected_nodes);

}

var select_colored = function() {
  var selected_nodes = [];
  d3.selectAll('.node').each(function(d, i) {
    var color = d3.rgb(this.style.fill).toString();
    if(color === '#ffffff' || color === stop_class_color) {
      return;
    }

    d3.select(this).attr("r", 10);
    selected_nodes.push(this);
  });

  activate_selection(selected_nodes); 
}

var show_selection = function(value) {
  deactivate_any_selection();
  socket.emit('node selection history', value);
}


var global_selected_nodes = [];
socket.on('stream node ids', function(message) {
  if(message.node_id === "done") {
    populate_distb_lists(global_selected_nodes);
    global_selected_nodes = null;
    global_selected_nodes = [];
    return;
  }

  var nodeid = parseInt(message.node_id);
  var node = d3.selectAll('.node')[0][parseInt(nodeid) - 1];
  d3.select(node).attr("r", 10);
  global_selected_nodes.push(node);

  // console.log(node);
  
    // animate_node(node_id);
});

