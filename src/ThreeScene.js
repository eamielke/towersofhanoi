import React, {Component} from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
// import OrbitControls from 'three-orbitcontrols';
import {Segment, Grid, Button, Responsive} from 'semantic-ui-react';


class ThreeScene extends Component {

    constructor(props) {
        super(props);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.resetCamera = this.resetCamera.bind(this);
        this.fullScreen = this.fullScreen.bind(this);

        this.state = {
            canvasHeight: '400px'
        };
    }

    componentDidMount() {

        window.addEventListener("resize", this.updateDimensions);

        if (this.props.discCount === 0) {
            return;
        }

        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        //ADD SCENE
        this.camera = new THREE.PerspectiveCamera(this.calcFOV(), width / height, 0.2, 20);


        this.scene = new THREE.Scene();

        let discArray = this.createDiscs();

        let pointLight = new THREE.PointLight(0xFFFF8F);

        // set its position
        pointLight.position.x = 10;
        pointLight.position.y = 20;
        pointLight.position.z = 130;

        // add to the scene
        this.scene.add(pointLight);

        for (let j = 0; j < discArray.length; j++) {
            this.scene.add(discArray[j]);
        }

        this.scene.updateMatrixWorld(true);
        this.scene.background = new THREE.Color('white');

        let thickness = this.calcThickness();
        let y = thickness * (discArray.length);
        for (let l = 0; l < discArray.length; l++) {

            y = y - thickness;

            discArray[l].position.set(0, y, 0);

        }

        //Setup tween

        TWEEN.removeAll();

        let tweenArray = [];

        let prevTween;
        for (let k = 0; k < this.props.moveHistory.length; k++) {
            let tween = this.createTweenForMoveAndDisc(thickness, this.getMaxDiscDiameter(),
                discArray, this.props.moveHistory[k], prevTween);
            tweenArray.push(tween);
            prevTween = tween;
        }


        //ADD RENDERER
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor('#000000');
        this.renderer.setSize(width, height);
        this.mount.appendChild(this.renderer.domElement);

        // this.controls = new OrbitControls( this.camera );
        //
        // this.controls.minPolarAngle = Math.PI/2;
        // this.controls.maxPolarAngle = Math.PI/2;
        // this.controls.minDistance = 1;
        // this.controls.maxDistance = 10;
        //
        // this.controls.minAzimuthAngle = 0; // radians
        // this.controls.maxAzimuthAngle = 0; // radians

        this.camera.position.x = discArray[0].position.x + (2.5 * this.getMaxDiscDiameter() + 0.1);
        this.camera.position.z = 3;


        this.start();
        tweenArray[0].start();

        console.log('Calling ComponentDidMount');

    }

    resetCamera() {
        debugger;

        if (this.mount) {
            const width = this.mount.clientWidth;
            const height = this.mount.clientHeight;

            //ADD SCENE
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
        }


    }

    componentDidUpdate() {
        this.resetCamera();
    }

    updateDimensions() {

        this.setState({width: window.innerWidth, height: window.innerHeight});

    }

    calcFOV() {

        return (3 * Math.log(this.props.discCount) + 19);
    }

    getMaxDiscDiameter() {
        return this.getScaleFactor() * (this.props.discCount - 1);
    }

    getScaleFactor() {

        return 0.15 / this.props.discCount;
    }

    calcThickness() {
        return 0.25 / this.props.discCount;
    }

    calcTransTime() {
        let transTime = 19200 / (this.props.discCount * this.props.discCount);
        if (transTime < 80) {
            transTime = 80;
        }
        return transTime;
    }

    createDiscs() {

        let discArray = [];

        let thickness = this.calcThickness();

        for (let i = 0; i < this.props.discCount; i++) {

            let geometry = new THREE.CylinderGeometry((i + 1) * this.getScaleFactor(), (i + 1) * this.getScaleFactor(), thickness, 30, 10);
            geometry.rotateX(Math.PI * 0.1); // rotate 90 degrees clockwise around z-axis

            let disc = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
                color: 'red',
                side: THREE.DoubleSide
            }));

            discArray.push(disc);
            console.log(i + ' Creating disc with diameter: ' + (i + 1) * this.getScaleFactor() + ' and thickness ' + thickness);
        }

        console.log("Disc array size: " + discArray.length);

        return discArray;

    }

    createTweenForMoveAndDisc(discThickness, discDiameter, discArray, move, previousTween) {

        //Calculate source X
        let sourceTower = move.sourceTower;
        let currentX = 0;
        let startX = 0;

        let totalThickness = this.calcThickness() * discArray.length;

        if (sourceTower) {
            currentX = (sourceTower.getTowerNumber() - 1) * (2.5 * this.getMaxDiscDiameter() + 0.1);
            startX = currentX;
        }

        //Calculate source Y
        let currentY = (sourceTower.getDiscs().length) * discThickness;

        //Calculate target Y
        let toY = 0;

        let targetTower = move.targetTower;

        if (targetTower.getDiscs().length === 0) {

            toY = 0;

        } else {

            toY = targetTower.getDiscs().length * discThickness;
        }

        // Calculate target X

        let rotDir = 1;
        if (targetTower.getTowerNumber() > sourceTower.getTowerNumber()) {
            rotDir = -1;
        }

        //Tower 1 is at position -0.5
        //Tower 2 is at -0.5 + 0.2 (max disc width)
        //Tower 3 is at -0.5 + 2*0.2 (max disc width)
        let toX = ((targetTower.getTowerNumber() - 1) * (2.5 * this.getMaxDiscDiameter() + 0.1));

        let currentDisc = {x: currentX, y: currentY, r: 0};

        let discObj = discArray[move.disc - 1];

        let transitionTime = this.calcTransTime();


        let tweenOver = new TWEEN.Tween(currentDisc)
            .to({
                x: [startX, toX * .9, toX],
                y: [0.8 * totalThickness, totalThickness, toY],
                r: [rotDir * Math.PI * 10]
            }, transitionTime)
            .easing(TWEEN.Easing.Quartic.Out)
            .onUpdate(function () {
                discObj.position.x = currentDisc.x;
                discObj.position.y = currentDisc.y;
                discObj.rotation.z = currentDisc.r;
            });

        if (previousTween) {
            previousTween.chain(tweenOver);
        }

        return tweenOver;
    }


    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
        window.removeEventListener("resize", this.updateDimensions);
    }

    start = () => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate)
        }
    };

    stop = () => {
        cancelAnimationFrame(this.frameId)
    };

    animate = () => {

        this.renderer.render(this.scene, this.camera);
        // let position = new THREE.Vector3();
        // position.setFromMatrixPosition(this.disc3.matrixWorld);

        // console.log("Cylinder position: " + position.x);
        // this.controls.update();

        this.frameId = window.requestAnimationFrame(this.animate);

        TWEEN.update();
    };


    fullScreen() {

        if (this.state.canvasHeight === '800px') {
            this.setState({canvasHeight: '400px', active: false});
        } else {
            this.setState({canvasHeight: '800px', active: true});
        }

    }


    render() {
        return (
            <Grid columns={1}>
                <Grid.Column>
                    <Responsive {...Responsive.onlyComputer} >
                        <Button toggle active={this.state.active} attached='top' onClick={this.fullScreen}>Enlarge</Button>
                    </Responsive>

                    <Responsive {...Responsive.onlyMobile}>
                        <div ref='hanoiCanvas' className='hanoi3d'
                             style={{height: this.state.canvasHeight, width: '100%', margin: '20px auto'}}

                             ref={(mount) => {
                                 this.mount = mount
                             }}
                        />
                    </Responsive>
                    <Responsive {...Responsive.onlyComputer}>
                        <Segment attached>
                            <div ref='hanoiCanvas' className='hanoi3d'
                                 style={{height: this.state.canvasHeight, width: '100%', margin: '20px auto'}}

                                 ref={(mount) => {
                                     this.mount = mount
                                 }}
                            />
                        </Segment>
                    </Responsive>
                </Grid.Column>
            </Grid>
        )
    }
}

export default ThreeScene