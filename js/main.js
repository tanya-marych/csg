var container;
var camera, scene,controls, renderer, mesh;

init();
animate();

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function init() {
    container = document.getElementById( 'root' );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.z = 2000;

    scene = new THREE.Scene();

    var axes = new THREE.AxisHelper(800);
    axes.position.set(0,0,0);
    scene.add(axes);

    createFacade("default");

    controls = new THREE.TrackballControls(camera );
    controls.rotateSpeed = 1.5;
    controls.zoomSpeed = 1.2;
    controls.noPan = false;
    controls.noRoll = false;
    controls.staticMoving = true;
    controls.minDistance = 1000;
    controls.maxDistance = camera.far;

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x000000 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
}

function createFacade(type,selectedMenu){
    if(selectedMenu!=type){
        document.getElementById("selected").innerHTML = "Selected : "+type;
        while(scene.children.length > 0){ scene.remove(scene.children[0]); }
        var width = 600, height = 800, depth = 40;
        var facadeMesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth,30,30));
        facadeMesh.position.z = 20;
        var result;
        var width = 600, height = 800, depth = 40, radius = 3,indent = 60;
        var lineDepth = 2, linesDepth = depth+lineDepth/2;
        var facadeBSP = new ThreeBSP(facadeMesh);
        switch(type){
            case 'corners':
                var lengthVertBig = 150, lengthVertSmall = 100, lengthHorizontalBig = 170, lengthHorizontalSmall = 120;
                var depthCorners = depth+1;
                //отрисовка нижнего уголка
                var vertBig = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,lengthVertBig,20,20));
                vertBig.position.x = width/2-40-radius/2;//40-отступ от края
                vertBig.position.y = -height/2+lengthVertBig/2+60-20;//60-отступ от края
                vertBig.position.z = depthCorners;
                var vertBigBSP = new ThreeBSP(vertBig);

                var vertSmall = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,lengthVertSmall,20,20));
                vertSmall.position.x = width/2-40 - 30-radius/2;//40-отступ от края,30-расстояние между линиями
                vertSmall.position.y = -height/2+lengthVertSmall/2+60-20;//60-отступ от края
                vertSmall.position.z = depthCorners;
                var vertSmallBSP = new ThreeBSP(vertSmall);

                var horizontalBig = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,lengthHorizontalBig,20,20));
                horizontalBig.rotation.z = Math.PI/2;
                horizontalBig.position.x = width/2-lengthHorizontalBig/2-radius/2-20;
                horizontalBig.position.y = -height/2+60;//60-отступ от края
                horizontalBig.position.z = depthCorners;
                var horizontalBigBSP = new ThreeBSP(horizontalBig);

                var horizontalSmall = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,lengthHorizontalSmall,20,20));
                horizontalSmall.rotation.z = Math.PI/2;
                horizontalSmall.position.x = width/2-lengthHorizontalSmall/2-radius/2-20;
                horizontalSmall.position.y = -height/2+60+30;//60-отступ от края
                horizontalSmall.position.z = depthCorners;
                var horizontalSmallBSP = new ThreeBSP(horizontalSmall);


                var corners1 =vertBigBSP.union(vertSmallBSP).union(horizontalBigBSP).union(horizontalSmallBSP);
                //вырезать нижний угол
                var resultCSG = facadeBSP.subtract(corners1);
                //развернуть для вырезания верхнего угла
                var tempCorn = corners1.toMesh();
                tempCorn.position.x = -tempCorn.position.x;
                tempCorn.position.y = -tempCorn.position.y;
                tempCorn.rotation.z = Math.PI;
                corners1 = new ThreeBSP(tempCorn);
                //вырезать верхний угол
                var resultCSG = resultCSG.subtract(corners1);
                result = resultCSG.toMesh();
            break;
            case 'frame':
                var verticalLeft = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,20,20));
                verticalLeft.position.x = -width/2+radius/2+indent;
                verticalLeft.position.z = linesDepth;
                var verticalLeftBSP = new ThreeBSP(verticalLeft);

                var verticalRight = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,20,20));
                verticalRight.position.x = width/2-radius/2-indent;
                verticalRight.position.z = linesDepth;
                var verticalRightBSP = new ThreeBSP(verticalRight);

                var horizontalBottom = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,width-2*indent,20,20));
                horizontalBottom.rotation.z = Math.PI/2;
                horizontalBottom.position.y =-height/2+indent ;
                horizontalBottom.position.z =linesDepth ;
                var horizontalBottomBSP = new ThreeBSP(horizontalBottom);

                var horizontalTop = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,width-2*indent,20,20));
                horizontalTop.rotation.z = Math.PI/2;
                horizontalTop.position.y =height/2-indent ;
                horizontalTop.position.z =linesDepth ;
                var horizontalTopBSP = new ThreeBSP(horizontalTop);

                var grid = verticalLeftBSP.union(verticalRightBSP).union(horizontalBottomBSP).union(horizontalTopBSP);

                var resultCSG = facadeBSP.subtract(grid);
                result = resultCSG.toMesh();
            break;
            case 'frame with lines':
                var verticalLeft = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,20,20));
                verticalLeft.position.x = -width/2+radius/2+indent;
                verticalLeft.position.z = linesDepth;
                var verticalLeftBSP = new ThreeBSP(verticalLeft);

                var verticalRight = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,20,20));
                verticalRight.position.x = width/2-radius/2-indent;
                verticalRight.position.z = linesDepth;
                var verticalRightBSP = new ThreeBSP(verticalRight);

                var horizontalBottom = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,width-2*indent,20,20));
                horizontalBottom.rotation.z = Math.PI/2;
                horizontalBottom.position.y =-height/2+indent ;
                horizontalBottom.position.z =linesDepth ;
                var horizontalBottomBSP = new ThreeBSP(horizontalBottom);

                var horizontalTop = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,width-2*indent,20,20));
                horizontalTop.rotation.z = Math.PI/2;
                horizontalTop.position.y =height/2-indent ;
                horizontalTop.position.z =linesDepth ;
                var horizontalTopBSP = new ThreeBSP(horizontalTop);

                //рамка
                var grid = verticalLeftBSP.union(verticalRightBSP).union(horizontalBottomBSP).union(horizontalTopBSP);
                var resultCSG = facadeBSP.subtract(grid);

                var widthForLines = width-2*radius-2*indent;
                    var count = parseInt(widthForLines / 45);
                    if (count >= 2) {
                        var distance = widthForLines / count;
                        console.log(distance);
                        var vertical = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height-2*indent,20,20));
                        vertical.position.x = -width/2+indent+radius;
                        for (var i = 1; i <= count - 1; i++) {
                            vertical.position.x +=distance;
                            vertical.position.z = linesDepth;
                            var verticalBSP = new ThreeBSP(vertical);
                            resultCSG =resultCSG.subtract(verticalBSP);
                        }
                    }
                result = resultCSG.toMesh();
            break;
            case 'greece':
                var indent = 65;
                var half = 33;
                var elementHeight = 3*half;

                var verticalSmall = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,half,20,20));
                verticalSmall.position.x = -width/2+indent+radius;
                verticalSmall.position.y = height/2-half/2;
                verticalSmall.position.z = linesDepth;
                var verticalSmallBSP = new ThreeBSP(verticalSmall);

                var horizontalBig = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,2*half+2*radius,20,20));
                horizontalBig.rotation.z = Math.PI/2;
                horizontalBig.position.x = -width/2+indent+radius+half;
                horizontalBig.position.y = height/2-half;
                horizontalBig.position.z = linesDepth;
                var horizontalBigBSP = new ThreeBSP(horizontalBig);

                var verticalBig = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,2*half,20,20));
                verticalBig.position.x = -width/2+indent+radius+2*half;
                verticalBig.position.y = height/2-2*half;
                verticalBig.position.z = linesDepth;
                var verticalBigBSP = new ThreeBSP(verticalBig);

                var horizontalSmall = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,half+2*radius,20,20));
                horizontalSmall.rotation.z = Math.PI/2;
                horizontalSmall.position.x = -width/2+indent+radius+1.5*half;
                horizontalSmall.position.y = height/2-3*half+radius;
                horizontalSmall.position.z = linesDepth;
                var horizontalSmallBSP = new ThreeBSP(horizontalSmall);

                var verticalSmall2 = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,half,20,20));
                verticalSmall2.position.x = -width/2+indent+half+radius;
                verticalSmall2.position.y = height/2-2.5*half;
                verticalSmall2.position.z = linesDepth;
                var verticalSmall2BSP = new ThreeBSP(verticalSmall2);

                var horizontalSmall2 = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,half+2*radius,20,20));
                horizontalSmall2.rotation.z = Math.PI/2;
                horizontalSmall2.position.x = -width/2+indent+half/2+radius;
                horizontalSmall2.position.y = height/2-2*half;
                horizontalSmall2.position.z = linesDepth;
                var horizontalSmall2BSP = new ThreeBSP(horizontalSmall2);

                var verticalSmall3 = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,half,20,20));
                verticalSmall3.position.x = -width/2+indent+radius;
                verticalSmall3.position.y = height/2-2.5*half;
                verticalSmall3.position.z = linesDepth;
                var verticalSmall3BSP = new ThreeBSP(verticalSmall3);

                var greeceBSP = verticalSmallBSP.union(horizontalBigBSP).union(verticalBigBSP).union(horizontalSmallBSP)
                        .union(verticalSmall2BSP).union(horizontalSmall2BSP).union(verticalSmall3BSP);
                var greece = greeceBSP.toMesh();

                var amount = height/ elementHeight+1;

                for(var i = 1;i<amount;i++){
                    greeceBSP = new ThreeBSP(greece);
                    facadeBSP = facadeBSP.subtract(greeceBSP);
                    greece.position.y -= elementHeight;
                }

                result = facadeBSP.toMesh();
            break;
            case 'grid':
                var width = 600, height = 800, depth = 40, radius = 6;
                var indent = 60;
                var lineWidth = 7, lineDepth = 2, linesDepth = depth-lineDepth/2;
                var verticalLeft = new THREE.Mesh(new THREE.BoxGeometry(lineWidth,height,lineDepth,20,20));
                verticalLeft.position.x =-width/2+indent ;
                verticalLeft.position.z =linesDepth ;
                var verticalLeftBSP = new ThreeBSP(verticalLeft);

                var verticalRight = new THREE.Mesh(new THREE.BoxGeometry(lineWidth,height,lineDepth,20,20));
                verticalRight.position.x =width/2-indent ;
                verticalRight.position.z =linesDepth ;
                var verticalRightBSP = new ThreeBSP(verticalRight);

                var horizontalBottom = new THREE.Mesh(new THREE.BoxGeometry(lineWidth,width,lineDepth,20,20));
                horizontalBottom.rotation.z = Math.PI/2;
                horizontalBottom.position.y =-height/2+indent ;
                horizontalBottom.position.z =linesDepth ;
                var horizontalBottomBSP = new ThreeBSP(horizontalBottom);

                var horizontalTop = new THREE.Mesh(new THREE.BoxGeometry(lineWidth,width,lineDepth,20,20));
                horizontalTop.rotation.z = Math.PI/2;
                horizontalTop.position.y =height/2-indent ;
                horizontalTop.position.z =linesDepth ;
                var horizontalTopBSP = new ThreeBSP(horizontalTop);

                var grid = verticalLeftBSP.union(verticalRightBSP).union(horizontalBottomBSP).union(horizontalTopBSP);

                var resultCSG = facadeBSP.subtract(grid);
                result = resultCSG.toMesh();
            break;
            case 'lines':
                var indentBetweenLines = 70;
                var horizontal = new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,width,20,20));
                horizontal.rotation.z = Math.PI/2;
                horizontal.position.z = linesDepth;

                var horizontalBSP;
                var amount = height/indentBetweenLines;
                for(var i = 1; i< amount;i++){
                    horizontal.position.y = height/2 - indentBetweenLines*i -radius;
                    horizontalBSP = new ThreeBSP(horizontal);
                    facadeBSP = facadeBSP.subtract(horizontalBSP);
                }
                result = facadeBSP.toMesh();
            break;
            default:
                result = facadeMesh;
            ;
        }

        //var loader = new THREE.TextureLoader();
        //var texture = loader.load("img/texture.jpg");
        //result.material = new THREE.MeshPhongMaterial({map: texture});
        result.material = new THREE.MeshNormalMaterial();
        scene.add( result );
    }
}

var selectedMenu = "default";
var myLi = document.getElementsByTagName('li');
for (var i = 0; i < myLi.length; i++) {
    myLi[i].addEventListener('click', function(){
        var type = this.innerHTML.toLowerCase();
        createFacade(type,selectedMenu);
    }, false);
}
