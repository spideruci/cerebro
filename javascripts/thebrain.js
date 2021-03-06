var color = d3.scale.category10();

var width = document.getElementsByTagName("body")[0].offsetWidth,
    height = 768;

var x_scale = d3.scale.linear()
    .range([-200, width + 1000]);

var y_scale = d3.scale.linear()
    .range([-350, height + 400]);

var force = d3.layout.force()
    .charge(-80)
    // .charge(function(v,i) {
    //   if (v.edges > 10) {return -1000;} 
    //   if (v.edges > 3) {return -200;}
    //   if (v.edges > 2) {return -100;}
    //   return -75;
    // })
    .linkDistance(function(d,i) {
      d0 = 1.0 - (Math.pow(d.value, 1.0/dampingFactor)/dampenedMaxDistance);
      d1 = 0.95*d0 + 0.05;
      d2 = d1 * 20; 
      // console.log('distance = ' + d2); 
      return d2;
    })
    // .linkDistance(1)
    // .linkStrength(function(d,i) {s0 = Math.sqrt(d.value)/sqrtMaxDistance; s1 = 0.5 + 0.5*s0; console.log('strength = ' + s1); return s1;})
    // .linkStrength(5)
    // .linkStrength(function(d,i) {s0 = Math.pow(d.value, 1.0/dampingFactor2)/dampenedMaxDistance2; s1 = 0.99*s0 + 0.01; s2 = s1 * 10.0; console.log('strength = ' + s2); return s2;})
    .linkStrength(function(d,i) {
      s = 0.5;
      if (d.value > 100) {s = 10;} 
      else if (d.value > 10) {s = 5;} 
      else if (d.value > 1) {s = 1;} 
      if ((d.source.fanout >= 20) || (d.target.fanin >= 20)) {s = s * 0.8}
      else if ((d.source.fanout >= 10 ) || (d.target.fanin >= 10 )) {s = s * 0.9}
      else if ((d.source.fanout >= 5 ) || (d.target.fanin >= 5 )) {s = s * 0.95};
      console.log('strength = ' + s);
      return s;
    })
    .theta(2.0)
    .size([width, height])
    ;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("style", "background-color: black")
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
var dampenedMaxDistance = 0;
var dampenedMaxDistance2 = 0;
var dampingFactor = 4;
var dampingFactor2 = 3;

d3.json("data/nano_test10.json", function(error, graph) {
  traces = graph.traces;
  traces_pointer = 0;
  ddg_nodes = graph.nodes;
  ddg_links = graph.links;
  var slider_element = document.getElementsByName("slider")[0];
  slider_element.max = traces[traces_pointer].length;

  var n = graph.nodes.length;
  for (i = 0; i < n; i++) {
    v = graph.nodes[i];
    v.fanin = 0;
    v.fanout = 0;
  }
  var m = graph.links.length;
  for (i = 0; i < m; i++) {
    e = graph.links[i];
    // console.log(e.value);
    if (maxDistance < e.value) {
      maxDistance = e.value;
    }
    graph.nodes[e.source].fanout++;
    graph.nodes[e.target].fanin++;
  }
  for (i = 0; i < n; i++) {
    console.log('fan in ' + graph.nodes[i].fanin + '  and fan out ' + graph.nodes[i].fanout);
  }
  dampenedMaxDistance = Math.pow(maxDistance, 1.0/dampingFactor);
  dampenedMaxDistance2 = Math.pow(maxDistance, 1.0/dampingFactor2);
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();
      console.log("force completed");

  var links = vis.selectAll(".link")
              .data(graph.links)
              .enter().append("line")
              .attr("class", "link")
              .attr("content", function(d) {return d.value;})
              .style("stroke-width", function(d) { return plateau(d.value); })
              ;

  var brush = vis.append("g")
  .attr("class", "brush")
  .call(d3.svg.brush().x(x_scale).y(y_scale)
  .on("brushstart", brushstart)
  .on("brush", function() {
        var extent = d3.event.target.extent();
        extent[0][0] = x_scale(extent[0][0]);
        extent[0][1] = y_scale(extent[0][1]);
        extent[1][0] = x_scale(extent[1][0]);
        extent[1][1] = y_scale(extent[1][1]);
        node.classed("selected", function(d) {
          return extent[0][0] <= d.x && d.x < extent[1][0]
              && extent[0][1] <= d.y && d.y < extent[1][1];
        });
        dict = [];
        method_dict = [];
        var selected_nodes = d3.selectAll("circle.selected")[0];
        for(var count = 0; count < selected_nodes.length; count += 1) {
          var temp = selected_nodes[count].getAttribute("content");
          put_classname_in_dict(temp);
          put_methodname_in_dict(temp);
        }
        var output = "Classes Selected: <br/>";

        for(var count2 = 0; count2 < dict.length; count2 += 1) {
          var classCount = dict[count2].value
          var count_markup = "<span class=\"badge\">" + classCount + "</span>";
          var className = dict[count2].key.substring("Class: ".length);
          var temp = count_markup + " " + className + "<br/>";
            
          output += temp;  
        }
        document.getElementById("classlist").innerHTML = output;
        
        var output2 = "Methods Selected: <br/>";
        for(var count2 = 0; count2 < method_dict.length; count2 += 1) {
          var methodName = method_dict[count2].key.substring("Method: ".length);
          var methodCount = "<span class=\"badge\">" + method_dict[count2].value + "</span>";
          var temp = methodCount + " " + methodName + "<br/>";
          output2 += temp;  
        }
        document.getElementById("methodlist").innerHTML = output2;
      })
  .on("brushend", brushend));

  d3.select("rect.background")
    .style("visibility", "visible")
    .style("stroke", "white")
    .style("fill-opacity", 0)
    .style("strokeWidth", "10px")
    ;

  var node = vis.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .attr("content", function(d) { return get_instruction_info(d); })
      ;

 

  var option_strings = new Array();
  for(var j = 0; j <= graph.traces.length; j += 1) {
    option_strings[j] = "execution" + j;
  }

  var exec_options = d3.select("select").selectAll("option")
                        .data(option_strings)
                        .enter().append("option")
                        .attr("value", function(d) {return d;})
                        .text(function(d) {return d;})
                        ;
      
    console.log("nodes completed");

  node.append("title")
      .text(function(d) { return get_instruction_info(d); });



  force.on("tick", function() {
    if( force.alpha() <= 0.0055 ) { 
      console.log(force.alpha());
      links.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; }); 
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      force.stop();
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
  });
});

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
  var length = traces[traces_pointer].length;
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
  playstate.innerHTML = "Playing";
  var slider = document.getElementsByName("slider")[0];
  slider.value = 1;
  timerCallBack();
}

var slowdown = function(value) {
  slider_delay = 1 * parseInt(value);
  var slowdownvalue = document.getElementsByName("slowdownvalue")[0];
  slowdownvalue.innerHTML = slider_delay;
}

var slide = function(value) {
  var nodes = vis.selectAll(".node");
  var length = traces[traces_pointer].length;
  var step_size = 1;
  var playback_delay = 10;
  var counter = value;
  var counter2 = 0;
  node = nodes[0][traces[traces_pointer][counter]]
  t00 = d3.select(node).transition().duration(10);
  t00.delay(function(d, j) { return (50) + (playback_delay); })
  .each("end", function() {
    counter2 = value;
    
    if(counter2 * step_size < length) {
      var curr_insn_div = document.getElementsByName("curr_insn")[0];
      var find = '\n';
      var re = new RegExp(find, 'g');
      curr_insn_div.innerHTML = get_instruction_info(ddg_nodes[traces[traces_pointer][counter2 * step_size]]).replace(re, "<br/>"); 
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
  .style("fill", function(d) { return color(d.group); });
}

var blink = function(start_pos) {
  start_pos = typeof start_pos !== 'undefined' ? start_pos : 0;
  document.getElementsByTagName("button")[3].disabled = true;
  var nodes = vis.selectAll(".node");
  var length = traces[traces_pointer].length;
  var step_size = 1;
  var playback_delay = 10;
  var counter = 0;
  var counter2 = 0;
  for (var i = start_pos; i < length; i += step_size) {
    node = nodes[0][traces[traces_pointer][i]]
    t00 = d3.select(node).transition().duration(10);
    t00.delay(function(d, j) { return (50) + (counter*playback_delay); })
    .each("end", function() {
      counter2 += 1;
      var slider_element = document.getElementsByName("slider")[0];
      slider_element.value = (counter2*step_size);
      
      if(counter2 * step_size < length) {
        var curr_insn_div = document.getElementsByName("curr_insn")[0];
        var find = '\n';
        var re = new RegExp(find, 'g');
        curr_insn_div.innerHTML = get_instruction_info(ddg_nodes[traces[traces_pointer][counter2 * step_size]]).replace(re, "<br/>"); 
      }
      
      // if((counter2 * step_size) >= length - (length % step_size) - 1) {
      //   document.getElementsByTagName("button")[3].disabled = false;
      // }

      if(slider_element.value >= length - 50) {
        document.getElementsByTagName("button")[3].disabled = false;
      }
    })
    .attr("r", "10")
    .style("fill", "white");

    var t11 = t00.transition().duration(10);
    t11.delay(function(d, k) { return (50) + 500  + (counter*playback_delay); })
    .each("end", function() {

    })
    .attr("r", "5")
    .style("fill", function(d) { return color(d.group); });
    counter += 1;
  }
}

var blink2 = function() {
  var nodes = vis.selectAll(".node");

  var t0 = nodes.transition().duration(10);
  t0.delay(function(d, i) { return i * 50; })
    .attr("r", "5")
    .style("fill", "white");

  var t1 = t0.transition().duration(10);
  t1.delay(function(d, i) { return (i * 50) + 500; })
    .attr("r", "3")
    .style("fill", function(d) { return color(d.group); });
}


var get_instruction_info = function(insn) {
  var str_temp = insn.name.replace(".", ", \nMethod: ");

  return "Line: " + str_temp.replace(".", ", \nClass: ") 
  + ", \nSource Code Line: " + insn.source.split('.').join(' '); 
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
    links[i].style.strokeWidth = 1 + "px";
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
  if(value > 225) {
    return Math.atan(value) * 15;
  }
  return Math.sqrt(value);
}

var change_execution = function(value) {
  document.getElementsByTagName("button")[3].disabled = false;
  var index = parseInt(value.substring("execution".length));
  traces_pointer = index;
  var slider_element = document.getElementsByName("slider")[0];
  slider_element.max = traces[traces_pointer].length;
  slider_element.value = slider_element.min;
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

// function brushmove() {
//   var e = d3.event.target.extent();
//   node.classed("selected", function(d) {
//             return extent[0][0] <= d.x && d.x < extent[1][0]
//                 && extent[0][1] <= d.y && d.y < extent[1][1];
//   });
// }

function brushend() {
  svg.classed("selected", !d3.event.target.empty());
}