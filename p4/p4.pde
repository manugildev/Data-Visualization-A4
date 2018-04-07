Table table; 

void setup(){
  size(500, 600);
  table = loadTable("res/memory.csv", "header");
  import_data(); 
}

void draw(){

}

void import_data(){
  int i = 0;
  for (TableRow row : table.rows()) {
    Row r = new Row();
    r.id = i;
    r.timestamp = row.getInt(2);
    r.filename = row.getString(4);
    r.additions = row.getInt(5);
    r.deletions = row.getInt(6);
    i++;
    println(r.id + " " + r.timestamp +" "+ r.filename + " " + r.additions + " " + r.deletions);
  }
  
}
