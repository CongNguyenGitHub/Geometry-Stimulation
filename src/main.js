import * as THREE from "three"
import { OrbitControls } from "lib/OrbitControls.js";
import { TeapotGeometry } from "lib/TeapotGeometry.js";
import { GLTFLoader } from "lib/GLTFLoader.js";
import { GLTFExporter } from "lib/GLTFExporter.js";
import { TransformControls } from "lib/TransformControls.js";

var hasLight = false,
    alpha = 0,
    playMusic = false;
var currentMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
var currentGeo = null;
var meshes = []; // Array to store the meshes
var lastMeshCreationTime = Date.now(); // Track the time of the last mesh creation

function isAnimationActive() {
    return $(".animation.active").length > 0;
}

function init() {
    var scene = new THREE.Scene();
    var loader = new GLTFLoader();
    var gui = new dat.GUI({autoPlace: false});
    $(".move_gui").append($(gui.domElement));
    var geometry, material, mesh;
    var light, lightHelper, lightGUI, hasLight = false;
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
        material = currentMaterial;

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
        currentGeo = geometry;
        mesh = new THREE.Mesh(geometry, material);
        scene.remove(scene.getObjectByName("geometry"));
        mesh.name = "geometry";
        mesh.castShadow = true;
        if (!isAnimationActive())
            {scene.add(mesh);}
      

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
                    light = getPointLight("#fff", 20, 100, 0.5);
                    light.position.set(5,10,5);
                    lightHelper = new THREE.PointLightHelper(light, 1);
                    break;
                case "Spot Light":
                    light = getSpotLight("#fff", 20, 100, 0.5, 0);
                    light.position.set(5,10,0);
                    lightHelper = new THREE.SpotLightHelper(light);
                    lightGUI.add(light, "penumbra", 0, 1);
                    break;
                case "Directional Light":
                    light = getDirectionalLight("#fff", 20, 100, 0.5);
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
            lightGUI.add(light, "distance", 0, 300);
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
            if (!isAnimationActive())
                {scene.add(mesh);}
            //scene.add(mesh); // Add the new mesh with the updated material
        }
    });
    //Handle event on click animation
    $(".animation").click(function () {
        resetButtons(); // Để mất trục tọa độ từ affine
        transformControls.detach();
        var $nameAnimation = $(this).text();
        if ($(".animation.active").removeClass("active")) {
            $(".animation.active").hasClass("active");
        }
        switch ($nameAnimation) {
            case "Animation 1":
                $(this).addClass("active");
                break;
            case "Animation 2":
                $(this).addClass("active");
                break;
            case "Remove Animation":
                // Remove all geometries from the scene
                meshes.forEach(function(mesh) {
                    scene.remove(mesh);
                });
                meshes = [];
    
                // Remove the current geometry object
                var geometryObject = scene.getObjectByName("geometry");
                if (geometryObject) {
                    scene.remove(geometryObject);
                }
    
                // Recreate the initial geometry
                if (currentGeo && currentMaterial) {
                    var newMesh = new THREE.Mesh(currentGeo, currentMaterial);
                    newMesh.name = "geometry";
                    newMesh.castShadow = true;
                    scene.add(newMesh);
                }
                $(".animation").removeClass("active");
                break;
        }
    });
    
    

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(10, 7, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    var cameraGUI = gui.addFolder("Camera");
    cameraGUI.add(camera, "fov", 0, 175).name("FOV").onChange(updateCamera);
    cameraGUI.add(camera, "near", 1, 50, 1).name("Near").onChange(updateCamera);
    cameraGUI.add(camera, "far", 1000, 5000, 10).name("Far").onChange(updateCamera);
    cameraGUI.open();

    function updateCamera() {
        resetButtons(); // Để mất trục tọa độ từ affine
        transformControls.detach();
        camera.updateProjectionMatrix();
        
    }

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
            // Kiểm tra trạng thái của animation đang active
            var isAnimationActive = $(".animation.active").length > 0;
    
            // Nếu có animation đang active và buttonId không phải là "#translate-light"
            if (isAnimationActive && buttonId !== "#translate-light") {
                return; // Không cho phép click vào các nút "translate", "rotate", "scale" khi có animation active
            }
    
            // Kiểm tra trạng thái của nút hiện tại
            var isActive = $(this).hasClass("icons-clicked");
    
            // Để các icon không cùng lúc hiển thị active
            $("#translate-light, #translate, #rotate, #scale").removeClass("icons-clicked");
    
            if (isActive) {
                // Nếu nút đang active, tắt chức năng và đổi màu lại
                controls.enabled = true;
                transformControlsEnabled = false;
                transformControls.detach();
                $(this).removeClass("icons-clicked");
            } else {
                // Nếu nút chưa active, bật chức năng và đổi màu
                var object = scene.getObjectByName(objectName);
                if (object) {
                    controls.enabled = false;
                    transformControls.detach();
                    transformControls.setMode(mode);
                    transformControls.attach(object);
                    if (objectName === "light" && mode === "translate") {
                        transformControls.addEventListener("change", function() {
                            //lightHelper.update(); // Không thực hiện cập nhật ở đây mà ở transformControls.addEventListener bên dưới: tức là di chuyển xong mới cập nhật
                        });
                    }
                    transformControlsEnabled = true;
                    $(this).addClass("icons-clicked");
                }
            }
        });
    }
    

    transformControls.addEventListener('dragging-changed', function(event) {
        controls.enabled = !event.value;
        if (event.value) {
            // Bắt đầu di chuyển - tạm ngừng cập nhật lightHelper
            // Dùng lightHelper.update() khi thả chuột (dragging-changed -> false)
        } else {
            // Kết thúc di chuyển - cập nhật lightHelper
            lightHelper.update();
        }
    });
    
    
    // Gọi hàm cho các trường hợp cụ thể
    setupTransformControl("#translate-light", "light", "translate");
    setupTransformControl("#translate", "geometry", "translate");
    setupTransformControl("#rotate", "geometry", "rotate");
    setupTransformControl("#scale", "geometry", "scale");
    

    transformControls.addEventListener("mousedown", function() {
        controls.enabled = false;
        transformControlsEnabled = true;
    });
    
    transformControls.addEventListener('change', function() {
        // Không cần gọi lightHelper.update() ở đây
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
            geometryObject.visible = false;
            // Di chuyển geometry thành 1 vòng tròn và lên xuống
            var elapsedTime = Date.now() - lastMeshCreationTime;
            if (elapsedTime >= 800) {
                var newMesh = new THREE.Mesh(currentGeo, currentMaterial);
                newMesh.name = "geometry";
                newMesh.castShadow = true;
                // Generate random positions within a specified range (adjust as needed)
                var minX = -50, maxX =50;
                var minY = -15, maxY = 40;
                var minZ = -50, maxZ = 50;

                newMesh.position.x = Math.random() * (maxX - minX) + minX;
                newMesh.position.y = Math.random() * (maxY - minY) + minY;
                newMesh.position.z = Math.random() * (maxZ - minZ) + minZ;

                scene.add(newMesh);
                meshes.push(newMesh);
    
                if (meshes.length > 20) {
                    var oldMesh = meshes.shift();
                    scene.remove(oldMesh);
                }
    
                lastMeshCreationTime = Date.now();
            }
            
            meshes.forEach(function(mesh) {
                mesh.position.y += 0.05;
                mesh.rotation.x += 0.02;
                mesh.rotation.y += 0.02;
            });
            break;
        case "Animation 2":
            geometryObject.visible = false;
            // Di chuyển geometry thành 1 vòng tròn và lên xuống
            var elapsedTime = Date.now() - lastMeshCreationTime;
            if (elapsedTime >= 1000) {
                var newMesh = new THREE.Mesh(currentGeo, currentMaterial);
                newMesh.name = "geometry";
                newMesh.castShadow = true;
                
                // Generate non-overlapping random positions within a specified range (adjust as needed)
                var minX = -50, maxX = 50;
                var minY = -15, maxY = 40;
                var minZ = -50, maxZ = 50;
                
                var positionFound = false;
                var maxAttempts = 100; // Maximum attempts to find a non-overlapping position
                var attempts = 0;

                while (!positionFound && attempts < maxAttempts) {
                    var posX = Math.random() * (maxX - minX) + minX;
                    var posY = Math.random() * (maxY - minY) + minY;
                    var posZ = Math.random() * (maxZ - minZ) + minZ;

                    newMesh.position.set(posX, posY, posZ);

                    var collision = false;
                    for (var i = 0; i < meshes.length; i++) {
                        if (newMesh.position.distanceTo(meshes[i].position) < 10) { // Adjust the distance threshold as needed
                            collision = true;
                            break;
                        }
                    }

                    if (!collision) {
                        positionFound = true;
                    }

                    attempts++;
                }

                if (positionFound) {
                    scene.add(newMesh);
                    meshes.push(newMesh);

                    if (meshes.length > 15) {
                        var oldMesh = meshes.shift();
                        scene.remove(oldMesh);
                    }

                    lastMeshCreationTime = Date.now();
                } else {
                    console.warn("Failed to find a non-overlapping position for the new mesh after maximum attempts.");
                }
    }

    meshes.forEach(function(mesh, index) {
        var offset = index * 10; // Độ cao khác nhau giữa các mesh

        mesh.position.y = (Math.sin((Date.now() + offset) * 0.002) + 1) * 10;
        mesh.rotation.y = (Date.now() + offset) * 0.002;
        mesh.rotation.z = (Date.now() + offset) * 0.001;
    });

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