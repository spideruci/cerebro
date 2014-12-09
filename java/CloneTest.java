public class CloneTest implements Cloneable{

    public static void main(String[] args) {
        CloneTest obj = new CloneTest("abc", 1, new int[] {1, 2, 3});
        CloneTest clone = (CloneTest)obj.clone();
        clone.setArray(1, 10);
        System.out.println(obj.array[1]);
        System.out.println(clone.array[1]);
    }

    String name;
    int marks;
    int[] array;
    public CloneTest(String s, int i, int[] array) {
        this.name = s;
        this.marks = i;
        this.array = array;
    }

    public void setName(String s) {
        name = s;
    }

    public void setMarks(int i) {
        marks = i;
    }

    public void setArray(int index, int i) {
        if(index >= this.array.length) index = this.array.length - 1;
        array[index] = i;
    }

    @Override
    public Object clone() {
        return new CloneTest(this.name, this.marks, this.array);
    }
}