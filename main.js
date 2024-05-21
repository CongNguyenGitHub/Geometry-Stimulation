import * as THREE from "three"
import { OrbitControls } from "lib/OrbitControls.js";
import { TeapotGeometry } from "lib/TeapotGeometry.js";
import { GLTFLoader } from "lib/GLTFLoader.js";
import { GLTFExporter } from "lib/GLTFExporter.js";
import { TransformControls } from "lib/TransformControls.js";

var hasLight = false,
    alpha = 0,
    playMusic = false;
var currentTexture = null;
var currentMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });



function init() {
    var scene = new THREE.Scene();
    var loader = new GLTFLoader();
    var gui = new dat.GUI({autoPlace: false});
    $(".move_gui").append($(gui.domElement));
    var geometry, material, mesh;
    var light, lightHelper, lightGUI, hasLight = false;
    material = new THREE.MeshPhongMaterial({ color: "#ffffff" });

    var gridHelper = new THREE.GridHelper(150, 30, "#fff", "#fff");
    gridHelper.position.y = -0.1;
    scene.add(gridHelper);

    $("#gridBox").click(function() {
        if ($(this).prop("checked")) {
            gridHelper.visible = true;
        }
        else {
            gridHelper.visible = false;
        }
    });
    let hasFeature = false;
    let colorFolder, materialFolder;
    //Handle event on click geometry
    $(".geometry").click(function () {
        resetButtons(); // Để mất trục tọa độ từ affine
        transformControls.detach();
        var geometryName = $(this).text();
        var geometry;
        var material = currentMaterial;

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
                geometry = new TeapotGeometry(4, 10);
                break;
            case "Tube":
                geometry = new THREE.TubeGeometry(getTube(6), 20, 2, 8, false);
                break;
            case "Heart":
                geometry = new THREE.ExtrudeGeometry(getHeart(), { amount: 2, bevelEnable: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 });
                break;
            case "Car":
                loader.load('./assets/model/car/scene.gltf', function (gltf) {
                    scene.remove(scene.getObjectByName("geometry"));
                    gltf.scene.scale.set(5, 5, 5);
                    gltf.scene.castShadow = true;
                    gltf.scene.name = "geometry";
                    scene.add(gltf.scene);
                    geometry = null;
                }, undefined, function (error) {
                    console.error(error);
                });
                return;
            case "Girl":
                loader.load('./assets/model/scifi_girl/scene.gltf', function (gltf) {
                    scene.remove(scene.getObjectByName("geometry"));
                    gltf.scene.scale.set(5, 5, 5);
                    gltf.scene.castShadow = true;
                    gltf.scene.name = "geometry";
                    scene.add(gltf.scene);
                    geometry = null;
                }, undefined, function (error) {
                    console.error(error);
                });
                return;
        }

        var mesh = new THREE.Mesh(geometry, material);
        scene.remove(scene.getObjectByName("geometry"));
        mesh.name = "geometry";
        mesh.castShadow = true;
        scene.add(mesh);

        if (hasFeature) {
            if (colorFolder) gui.removeFolder(colorFolder);
            if (materialFolder) gui.removeFolder(materialFolder);
        }

        hasFeature = true;

        var colorParams = {
            color: 0xffffff
        };
        colorFolder = gui.addFolder('Color');
        colorFolder.addColor(colorParams, 'color').onChange(function () {
            mesh.material.color.set(colorParams.color);
        });
        colorFolder.open();

        var materialParams = {
            materialType: 'Basic'
        };
        materialFolder = gui.addFolder('Material');
        materialFolder.add(materialParams, 'materialType', ['Basic', 'Phong', 'Standard', 'Lambert']).onChange(function () {
            updateMaterial();
        });
        materialFolder.open();

        function updateMaterial() {
            var materialColor = colorParams.color;
            switch (materialParams.materialType) {
                case 'Basic':
                    material = new THREE.MeshBasicMaterial({ color: materialColor });
                    break;
                case 'Phong':
                    material = new THREE.MeshPhongMaterial({ color: materialColor });
                    break;
                case 'Standard':
                    material = new THREE.MeshStandardMaterial({ color: materialColor });
                    break;
                case 'Lambert':
                    material = new THREE.MeshLambertMaterial({ color: materialColor });
                    break;
            }
            mesh.material = material;
        }
    });

    
    $("#surfaceSelect").click(function () {
        if(geometry!=null){
            scene.remove(scene.getObjectByName("geometry"));

            var materialName = $(this).prop("value"),
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

    $("#loadTexture").change(function(event) {
        var file = event.target.files[0];
        var reader = new FileReader();
    
        reader.onload = function(e) {
            var dataURL = e.target.result;
            loadTexture(dataURL); // load texture from file
        };
    
        reader.readAsDataURL(file);
    });
    
    function loadTexture(dataURL) {
        if(geometry!=null){
            scene.remove(scene.getObjectByName("geometry"));
            var textureLoader = new THREE.TextureLoader();
            var texture = textureLoader.load(dataURL);
            material = new THREE.MeshBasicMaterial( { map:texture } );
            mesh = new THREE.Mesh(geometry, material);
            mesh.name = "geometry";
            mesh.castShadow = true;
            scene.add(mesh);
        }
    }

    $("#import").change(function(event) {
        var file = event.target.files[0];
        var reader = new FileReader();
    
        reader.onload = function(e) {
            var dataURL = e.target.result;
            loader.load(dataURL, function(gltf) {
                var models = gltf.scene.children;
                for (let i = 0; i < models.length; i++) {
                    if (models[i].isMesh) {
                        console.log(models[i]);
                        mesh = models[i];
                        geometry = mesh.geometry;
                        console.log(geometry);
                        material = mesh.material;
                        console.log(material);
                        scene.add(mesh);
                    }
                }
            });
        };
    
        reader.readAsDataURL(file);
        
    });
    
    $("#export").click(function() {
        var gltfExporter = new GLTFExporter();
        gltfExporter.parse(scene, function (gltf) {
            var blob = new Blob([JSON.stringify(gltf)], { type: 'application/octet-stream' });
            saveAs(blob, 'scene.gltf');
        });
    });

    $(".light").click(function() {
        resetButtons(); // Reset button states
        transformControls.detach(); // Detach any active transform controls

        var plane = getPlane(150);
        
        if (hasLight == true) {
            scene.remove(scene.getObjectByName("light"));
            scene.remove(scene.getObjectByName("lightHelper"));
            gridHelper.remove(gridHelper.getObjectByName("plane"));
            hasLight = false;
            light = undefined;
            lightHelper = undefined;
            gui.removeFolder(lightGUI);
        }       
        
        var lightName = $(this).text();
        
        if (lightName != "Remove Light") {
            gridHelper.add(plane);

            lightGUI = gui.addFolder("Light");

            switch (lightName) {
                case "Point Light":
                    light = getPointLight("#fff", 10, 50, 0.5);
                    light.position.set(5,10,5);
                    lightHelper = new THREE.PointLightHelper(light, 1);
                    break;
                case "Spot Light":
                    light = getSpotLight("#fff", 10, 50, 0.5, 0.1);
                    light.position.set(5,10,0);
                    lightHelper = new THREE.SpotLightHelper(light);
                    lightGUI.add(light, "penumbra", 0, 1);
                    break;
                case "Directional Light":
                    light = getDirectionalLight("#fff", 10, 50, 0.5);
                    light.position.set(5,10,5);
                    lightHelper = new THREE.DirectionalLightHelper(light);
                    break;
            }
               
            if (light != undefined && hasLight == false) {
                light.castShadow = true;
                light.name = "light";
                lightHelper.name = "lightHelper"
                scene.add(light);
                scene.add(lightHelper);
                hasLight = true;
            }

            var lightColor = { color: light.color.getHex() };
            lightGUI.addColor(lightColor, "color").onChange((value) => {
                light.color.set(value);
            });
            lightGUI.add(light, "intensity", 0, 100);
            lightGUI.add(light, "distance", 0, 100);
            lightGUI.add(light, "decay", 0, 5);

            lightGUI.open();
        }

    });
    // Handle event on click texture
    $(".texture").click(function () {
        resetButtons(); // Để mất trục tọa độ từ affine
        transformControls.detach();

        var loader = new THREE.TextureLoader();
        var materialName = $(this).text();

        // Ensure the current geometry is retrieved properly
        var currentObject = scene.getObjectByName("geometry");
        if (!currentObject) {
            console.error("No geometry found to apply the texture.");
            return;
        }

        geometry = currentObject.geometry; // Get the current geometry

        switch (materialName) {
            case "Floral Pattern":
                currentMaterial = new THREE.MeshBasicMaterial({
                    map: loader.load("./assets/textures/flowers.webp"),
                });
                break;
            case "Wood Pattern":
                currentMaterial = new THREE.MeshBasicMaterial({
                    map: loader.load("./assets/textures/wood.webp"),
                });
                break;
            case "Planet Surface":
                currentMaterial = new THREE.MeshBasicMaterial({
                    map: loader.load("./assets/textures/solar.jpg"),
                });
                break;
            case "Ocean Video":
                var video = document.createElement('video');
                video.loop = true;
                video.src = "./assets/textures/ocean.mp4"; // replace with your GIF file path
                video.load();
                video.play();

                var videoTexture = new THREE.VideoTexture(video);
                currentMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
                break;
            case "Remove Texture":
                currentMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
                break;
        }

        if (currentMaterial && geometry) {
            scene.remove(currentObject); // Remove the existing mesh
            mesh = new THREE.Mesh(geometry, currentMaterial);
            mesh.name = "geometry";
            mesh.castShadow = true; // Shadow (đổ bóng).
            scene.add(mesh); // Add the new mesh with the updated material
        }
    });
    //Handle event on click animation
    $(".animation").click(function () {
        resetButtons(); // Để mất trục tọa độ từ affine
        transformControls.detach();
        var $nameAnimation = $(this).text();
        if ($(".animation.active").hasClass("active")) {
            $(".animation.active").removeClass("active");
        }
        switch ($nameAnimation) {
            case "Animation 1":
                $(this).addClass("active");
                break;
            case "Animation 2":
                $(this).addClass("active");
                break;
            case "Animation 3":
                $(this).addClass("active");
                break;
            case "Animation 4":
                $(this).addClass("active");
                break;
            case "Animation 5":
                $(this).addClass("active");
                break;
            case "Remove Animation":
                break;
        }
    });
    

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(10, 7, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 46);
    renderer.setClearColor("#333");
    renderer.shadowMap.enabled = true; 
    renderer.render(scene, camera);
    document.getElementById('webgl').appendChild(renderer.domElement);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    var transformControls = new TransformControls(camera, renderer.domElement);
    var transformControlsEnabled = false;
    scene.add(transformControls);

    function setupTransformControl(buttonId, objectName, mode) {
        $(buttonId).click(function() {
            // Để các icon không cùng lúc hiển thị active
            $("#translate-light, #translate, #rotate, #scale").removeClass("icons-clicked");
           
            if ($(this).hasClass("icons-clicked")) {
                controls.enabled = true;
                transformControlsEnabled = false;
                transformControls.detach();
                $(this).removeClass("icons-clicked");
            } else {
                var object = scene.getObjectByName(objectName);
                if (object) {
         
                    controls.enabled = false;
                    transformControls.detach();
                    transformControls.setMode(mode);
                    transformControls.attach(object);
                    if (objectName === "light" && mode === "translate") {
                        transformControls.addEventListener("change", function() {
                            //lightHelper.update();
                        });
                    }
                    transformControlsEnabled = true;
                    $(this).addClass("icons-clicked");
                }
                
            }
        });
    }
    
    
    // Gọi hàm cho các trường hợp cụ thể
    setupTransformControl("#translate-light", "light", "translate");
    setupTransformControl("#translate", "geometry", "translate");
    setupTransformControl("#rotate", "geometry", "rotate");
    setupTransformControl("#scale", "geometry", "scale");
    

    transformControls.addEventListener("mousedown", function() {
        controls.enabled = false;
        transformControlsEnabled = true;
    });
    
    document.addEventListener("mousedown", function() {
        if (!transformControls.dragging) {
            controls.enabled = true;
            transformControlsEnabled = false;
        }
    });

    update(renderer, scene, camera, controls);
}

function update(renderer, scene, camera, controls) {
    renderer.render(scene, camera);
    controls.update();
    
    // Fetch the current geometry from the scene
    var geometryObject = scene.getObjectByName("geometry");
    if (!geometryObject) {
        requestAnimationFrame(function () {
            update(renderer, scene, camera, controls);
        });
        return;
    }
    var geometry = geometryObject.geometry;

    var name = $(".animation.active").text();
    switch (name) {
        case "Animation 1":
            // Di chuyển geometry thành 1 vòng tròn và lên xuống
            var radius = 35; // Bán kính của vòng tròn
            var speed = 0.0008; // Tốc độ di chuyển
            var rotationSpeed = 0.001; // Tốc độ quay
            var height = 60; // Biên độ của chuyển động lên xuống
            var angle = Date.now() * speed; // Góc xoay

            // Tính toán vị trí mới của geometry trên vòng tròn
            var x = Math.cos(angle) * radius;
            var z = Math.sin(angle) * radius;
            var y = Math.sin(angle * 2) * height; // Lên xuống

            geometryObject.position.set(x, y, z);

            // Cập nhật góc quay của geometry
            var rotationAngle = Date.now() * rotationSpeed;
            geometryObject.rotation.y = rotationAngle;

            break;
        case "Animation 2":
            // Animation di chuyển theo hình ngôi sao
            var starPoints = 5; // Số cánh của ngôi sao
            var outerRadius = 50; // Bán kính ngoài của ngôi sao
            var innerRadius = 20; // Bán kính trong của ngôi sao
            var speed = 0.001; // Tốc độ di chuyển
            var time = Date.now() * speed;
            var starVertices = [];

            // Tạo các điểm cho ngôi sao
            for (let i = 0; i < 2 * starPoints; i++) {
                let radius = i % 2 === 0 ? outerRadius : innerRadius;
                let angle = (i * Math.PI) / starPoints;
                starVertices.push({
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius
                });
            }

            // Xác định vị trí hiện tại dựa trên thời gian
            var index = Math.floor(time) % starVertices.length;
            var nextIndex = (index + 1) % starVertices.length;
            var progress = time % 1;

            // Nội suy giữa các điểm để di chuyển mượt mà
            var currentX = THREE.MathUtils.lerp(starVertices[index].x, starVertices[nextIndex].x, progress);
            var currentY = THREE.MathUtils.lerp(starVertices[index].y, starVertices[nextIndex].y, progress);

            geometryObject.position.set(currentX, currentY, 0);

            break;
            
        case "Animation 3":
            // Di chuyển theo hình cánh bướm
            var time = Date.now() * 0.001;
            var scale = 10;

            var x = scale * Math.sin(time) * (Math.exp(Math.cos(time)) - 2 * Math.cos(4 * time) - Math.pow(Math.sin(time / 12), 5));
            var y = scale * Math.cos(time) * (Math.exp(Math.cos(time)) - 2 * Math.cos(4 * time) - Math.pow(Math.sin(time / 12), 5));
            var z = scale * Math.sin(time / 4);

            geometryObject.position.set(x, y, z);
            break;
        case "Animation 4":
            // Lemniscate of Bernoulli
            var scale = 30;
            var time = Date.now() * 0.001;
        
            var x = scale * Math.cos(time) / (1 + Math.sin(time) * Math.sin(time));
            var y = scale * Math.cos(time) * Math.sin(time) / (1 + Math.sin(time) * Math.sin(time));
            var z = scale * Math.sin(time / 2);
        
            geometryObject.position.set(x, y, z);
        
            // Cập nhật góc quay của geometry
            var rotationSpeed = 0.001; // Tốc độ quay
            var rotationAngle = Date.now() * rotationSpeed;
            geometryObject.rotation.x += rotationSpeed;
            geometryObject.rotation.y = rotationAngle;
            geometryObject.rotation.z += rotationSpeed;
        
            break;
            
        case "Animation 5":
            // Add your Animation 5 logic here if needed.
            break;
    }

    requestAnimationFrame(function () {
        update(renderer, scene, camera, controls);
    });
}

function resetButtons() { // Để mất trục tọa độ từ affine
    $("#translate-light, #translate, #rotate, #scale").removeClass("icons-clicked"); // Hủy chọn button
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

function getPlane(size) {
    var geo = new THREE.PlaneGeometry(size, size);
    var mat = new THREE.MeshStandardMaterial({
        color: "#333",
        side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.name = "plane";
    return mesh;
}

function getPointLight(color, intensity, distance, decay) {
    var light = new THREE.PointLight(color, intensity, distance, decay);
    return light;
}

function getSpotLight(color, intensity, distance, decay, penumbra) {
    var light = new THREE.SpotLight(color, intensity);
    light.distance = distance;
    light.decay = decay;
    light.penumbra = penumbra;
    return light;
}

function getDirectionalLight(color, intensity, distance, decay) {
    var light = new THREE.SpotLight(color, intensity);
    light.distance = distance;
    light.decay = decay;
    return light;
}

init();
