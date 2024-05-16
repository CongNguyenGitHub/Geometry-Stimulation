import * as THREE from 'three'; // Thay đổi dường dẫn import 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // Thay đổi đường dẫn import
function init() {
    var scene = new THREE.Scene();

    var geometry, material, mesh;
    material = new THREE.MeshBasicMaterial({ color: "#ffffff" });

    var gridHelper = new THREE.GridHelper(150, 30, "#fff", "#fff");
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    $(".geometry").click(function () {

        var geometryName = $(this).text();
        switch (geometryName) {
            case "Box":
                geometry = new THREE.BoxGeometry(5, 5, 5);
                break;
            case "Sphere":
                geometry = new THREE.SphereGeometry(3);
                break;
            case "Cone":
                geometry = new THREE.ConeGeometry(3, 8, 32);
                break;
            case "Cylinder":
                geometry = new THREE.CylinderGeometry(3, 3, 8, 32);
                break;
            case "Torus":
                geometry = new THREE.TorusGeometry(4, 2, 16, 100);
                break;
        }
        mesh = new THREE.Mesh(geometry, material);

        scene.remove(scene.getObjectByName("geometry"));

        mesh.name = "geometry";
        mesh.castShadow = true; 

        scene.add(mesh);
    });


    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(10, 7, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 46);
    renderer.setClearColor("#15151e");
    renderer.shadowMap.enabled = true; 
    renderer.render(scene, camera);
    document.getElementById('webgl').appendChild(renderer.domElement);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    update(renderer, scene, camera, controls);
}

function update(renderer, scene, camera, controls) {
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(function () {
        update(renderer, scene, camera, controls);
    });
}

init();
