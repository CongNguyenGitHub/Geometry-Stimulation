import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
function init() {
    var scene = new THREE.Scene();
    var loader = new GLTFLoader();
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
            case "Teapot":
                geometry=new TeapotGeometry(4, 10);
                break;
            case "Tube":
                geometry = new THREE.TubeGeometry(getTube(6), 20, 2, 8, false);
                break;
            case "Heart":
                geometry = new THREE.ExtrudeGeometry(getHeart(), { amount: 2, bevelEnable: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 });
                break;
            case "Car":
                loader.load( './assets/model/car/scene.gltf', function ( gltf ) {
                    scene.remove(scene.getObjectByName("geometry"));
                    gltf.scene.scale.set(5,5,5);
                    gltf.scene.castShadow=true;
                    gltf.scene.name="geometry";
                    scene.add(gltf.scene);
                    geometry=null;
                
                }, undefined, function ( error ) {
                
                    console.error( error );
                
                } );
                return;
            case "Girl":
                loader.load( './assets/model/scifi_girl/scene.gltf', function ( gltf ) {
                    scene.remove(scene.getObjectByName("geometry"));
                    gltf.scene.scale.set(5,5,5);
                    gltf.scene.castShadow=true;
                    gltf.scene.name="geometry";
                    scene.add(gltf.scene);
                    geometry=null;
                
                }, undefined, function ( error ) {
                
                    console.error( error );
                
                } );
                return;

        }
        mesh = new THREE.Mesh(geometry, material);

        scene.remove(scene.getObjectByName("geometry"));

        mesh.name = "geometry";
        mesh.castShadow = true; 

        scene.add(mesh);
       
    });
    
    $(".surface").click(function () {
        if(geometry!=null){
            scene.remove(scene.getObjectByName("geometry"));

            var materialName = $(this).text(),
                materialColor = material.color;

            switch (materialName) {
                case "Point":
                    material = new THREE.PointsMaterial({ color: materialColor, size: 0.2 });
                    mesh = new THREE.Points(geometry, material);
                    break;
                case "Line":
                    material = new THREE.LineBasicMaterial({ color: materialColor });
                    mesh = new THREE.Line(geometry, material);
                    break;
                case "Solid":
                    material = new THREE.MeshBasicMaterial({ color: materialColor });
                    mesh = new THREE.Mesh(geometry, material);
                    break;
            }
            mesh.name = "geometry";
            mesh.castShadow = true; // Shadow (đổ bóng).
            scene.add(mesh);
        }
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
function getHeart() {
    const x = -10,
        y = -10;
    var heartShape = new THREE.Shape();
    heartShape.moveTo(x + 5, y + 5);
    heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

    return heartShape;
}

function getTube(size) {
    class CustomSinCurve extends THREE.Curve {
        constructor(scale = 1) {
            super();

            this.scale = scale;
        }

        getPoint(t, optionalTarget = new THREE.Vector3()) {
            const tx = t * 3 - 1.5;
            const ty = Math.sin(2 * Math.PI * t);
            const tz = 0;

            return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
        }
    }

    return new CustomSinCurve(size);
}
init();
