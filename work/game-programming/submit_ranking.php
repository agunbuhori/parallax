<?php

$name = $_REQUEST['name'];
$time = $_REQUEST['time'];
$difficult_id = $_REQUEST['difficult_id'];

$con = new mysqli('localhost', 'root', '', '31_module_e');
$query = "insert into ranking(name, difficult_id, time) values('{$name}', {$difficult_id}, {$time})";
$con->query($query);

$query = "select a.id, a.name, b.name as difficult, time from ranking as a join difficult b on a.difficult_id = b.id where difficult_id = {$difficult_id}";
$rs = $con->query($query);
$result = [];

while($row = $rs->fetch_assoc()) {
    $result[] = $row;
}

header('Content-type:application/json');
echo json_encode($result);