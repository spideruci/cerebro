import java.util.*;
import java.io.*;

public class DataMgr {
	public static void main(String[] args) throws IOException {
		File file = new File("/home/vijay/ProgramAnalysis/Snitch/DataTrace/controlflow.fdeng.tmp.sdg");
		file = new File("/home/vijay/ProgramAnalysis/Fang/stars_fang/files/flex/flex-DV1/flex-DV1.fdeng.sdg");
		Scanner scanner = new Scanner(file);
		ArrayList<String> nodes = new ArrayList<String>();
		
		while(scanner.hasNextLine()) {
			// System.out.print("here\n");
			String line = scanner.nextLine();
			// System.out.println(line);
			
			
			// get the nodes
			if(line.startsWith("2")) {
				String[] rec = line.split(" ");
				// System.exit(0);
				Node node = new Node();
				node.name = rec[1] + " " + rec[3];
				node.group = rec[2];
				nodes.add(rec[1] + " " + rec[2]);
				printNodeJson(node);
				continue;
			}

			// get the edges
			if(line.startsWith("3")) {
				String[] rec = line.split(" ");
				Edge edge = new Edge();
				String source_line = rec[1];
				String source_method = rec[2];
				String target_line = rec[3];
				String target_method = rec[4];
				String group = rec[5];
				// edge.source = getID(nodes, source_line, source_method) + "";
				edge.source = nodes.indexOf(source_line + " " + source_method) + "";
				edge.target = nodes.indexOf(target_line + " " + target_method) + "";
				// edge.target = getID(nodes, target_line, target_method) + "";
				edge.group = group.startsWith("d") ? "1" : "0";
				printEdgeJson(edge);
				// edges.add(edge);
				continue;
			}
		}
		// printNodesJson(nodes);
		System.out.println();
		// printEdgesJson(edges);
	}

	private static int getID(ArrayList<Node> nodes, 
		String line, String method) {
		int id = 0;
		for(Node node : nodes) {
			if(node.group.equals(method) && node.name.startsWith(line)) {
				id = nodes.indexOf(node);
			}
		}
		return id;
	}

	private static void printNodeJson(Node node) {
		System.out.println("{ \"name\":\"" + node.name + "\",\"group\":" + node.group + " },");
	}

	private static void printNodesJson(ArrayList<Node> nodes) {
		for(Node node : nodes) {
			System.out.println("{ \"name\":\"" + node.name + "\",\"group\":" + node.group + " },");
		}
	}

	private static void printEdgeJson(Edge edge) {
		System.out.println("{ " + 
				"\"source\":" + edge.source + "," +
				"\"target\":" + edge.target + "," +
				"\"value\":" + edge.value + "," +
				"\"group\":" + edge.group +
				" },");
	}

	private static void printEdgesJson(ArrayList<Edge> edges) {
		for(Edge edge : edges) {
			System.out.println("{ " + 
				"\"source\":" + edge.source + "," +
				"\"target\":" + edge.target + "," +
				"\"value\":" + edge.value + "," +
				"\"group\":" + edge.group +
				" },");
		}
	}

}

class Node {
	public String name; // {line id} {file name}
	public String group; // {method id}

}

class Edge {
	public String source;
	public String target;
	public String value = "1";
	public String group;
}