import React, {Component} from 'react';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
// import OrbitControls from 'three-orbitcontrols';
import {Segment, Grid, Header, Menu, Responsive} from 'semantic-ui-react';
import {composePage, calcTotalPages} from "./PagingUtil";


class TowerRenderer extends Component {

    constructor(props) {
        super(props);
        this.updateDimensions = this.updateDimensions.bind(this);
        this.resetCamera = this.resetCamera.bind(this);
        this.fullScreen = this.fullScreen.bind(this);
        this.toggleAnimation = this.toggleAnimation.bind(this);
        this.isAnimationComplete = this.isAnimationComplete.bind(this);
        this.disposeThreeJS = this.disposeThreeJS.bind(this);

        this._pageSize = 5;
        this._currentPageNo = 0;
        this._discs = [];
        this._camera = {};
        this._scene = {};
        this._totalPages = 0;
        this._currentMovePage = {};
        this._currentPageNo = 0;
        this._currentMoveIndex = 0;
        this._renderer = {};
        this._mount = {};

        this.state = {
            canvasHeight: '300px',
            currentMove: this.props.moveHistory[0],
            paused: false,
        };

    }

    componentDidMount() {

        window.addEventListener("resize", this.updateDimensions);

        if (this.props.discCount === 0) {
            return;
        }

        const width = this._mount.clientWidth;
        const height = this._mount.clientHeight;

        //ADD SCENE
        this._camera = new THREE.PerspectiveCamera(this.calcFOV(), width / height, 0.2, 20);

        this._scene = new THREE.Scene();

        let discArray = this.createDiscs();

        let pointLight = new THREE.PointLight(0xFFFF8F);

        // set its position
        pointLight.position.x = 10;
        pointLight.position.y = 20;
        pointLight.position.z = 130;

        // add to the scene
        this._scene.add(pointLight);

        for (let i = 0; i < discArray.length; i++) {
            this._scene.add(discArray[i]);
        }

        this._scene.updateMatrixWorld(true);
        this._scene.background = new THREE.Color('white');

        let thickness = this.calcThickness();
        let y = thickness * (discArray.length);
        for (let i = 0; i < discArray.length; i++) {

            y = y - thickness;

            discArray[i].position.set(0, y, 0);

        }

        //Setup tween
        TWEEN.removeAll();

        this._totalPages = calcTotalPages(this.props.moveHistory, this._pageSize);

        //Get the moves to create the first 1000 tweens.
        this._currentMovePage = composePage(this.props.moveHistory, this._pageSize, this._currentPageNo);

        let prevTween;
        let firstTween;
        this._currentMovePage.forEach((move, i) => {
            let tween = this.createTweenForMoveAndDisc(thickness, this.getMaxDiscDiameter(),
                discArray, this._currentMovePage[i], prevTween);

            if (i === 0) {
                firstTween = tween;
            }

            prevTween = tween;
        });


        //ADD RENDERER
        this._renderer = new THREE.WebGLRenderer({antialias: true});
        this._renderer.setClearColor('#000000');
        this._renderer.setSize(width, height);
        this._mount.appendChild(this._renderer.domElement);

        // this.controls = new OrbitControls( this.camera );
        //
        // this.controls.minPolarAngle = Math.PI/2;
        // this.controls.maxPolarAngle = Math.PI/2;
        // this.controls.minDistance = 1;
        // this.controls.maxDistance = 10;
        //
        // this.controls.minAzimuthAngle = 0; // radians
        // this.controls.maxAzimuthAngle = 0; // radians

        this._camera.position.x = discArray[0].position.x + (2.5 * this.getMaxDiscDiameter() + 0.1);
        this._camera.position.z = 3;


        this.start();
        if (firstTween) {
            firstTween.start();
        }

        this.setState({paused: false});

        //console.log('Calling ComponentDidMount');

    }

    resetCamera() {

        if (this._mount) {
            const width = this._mount.clientWidth;
            const height = this._mount.clientHeight;

            //ADD SCENE
            this._camera.aspect = width / height;
            this._camera.updateProjectionMatrix();

            this._renderer.setSize(width, height);
        }


    }

    componentDidUpdate() {
        this.resetCamera();
    }

    updateDimensions() {
        //console.log('Updating state in child component');
        this.setState({width: window.innerWidth, height: window.innerHeight});
        this.props.updateDimensions();

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
        if (transTime < 500) {
            transTime = 500;
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

            this._discs.push(disc);

            discArray.push(disc);
            //console.log(i + ' Creating disc with diameter: ' + (i + 1) * this.getScaleFactor() + ' and thickness ' + thickness);
        }

        //console.log("Disc array size: " + discArray.length);

        return discArray;

    }

    createTweenForMoveAndDisc(discThickness, discDiameter, discArray, move, previousTween) {

        //Calculate source X
        let currentX = 0;
        let startX = 0;

        let totalThickness = this.calcThickness() * discArray.length;

        if (move.sourceTowerNumber) {
            currentX = (move.sourceTowerNumber - 1) * (2.5 * this.getMaxDiscDiameter() + 0.1);
            startX = currentX;
        }

        //Calculate source Y
        let currentY = (move.sourceTowerDiscs) * discThickness;

        //Calculate target Y
        let toY = 0;

        if (move.targetTowerDiscs === 0) {

            toY = 0;

        } else {

            toY = move.targetTowerDiscs * discThickness;
        }

        // Calculate target X

        let rotDir = 1;
        if (move.targetTowerNumber > move.sourceTowerNumber) {
            rotDir = -1;
        }

        //Tower 1 is at position -0.5
        //Tower 2 is at -0.5 + 0.2 (max disc width)
        //Tower 3 is at -0.5 + 2*0.2 (max disc width)
        let toX = ((move.targetTowerNumber - 1) * (2.5 * this.getMaxDiscDiameter() + 0.1));

        let currentDisc = {x: currentX, y: currentY, r: 0};

        let discObj = discArray[move.disc - 1];

        let transitionTime = this.calcTransTime();

        let newTween = new TWEEN.Tween(currentDisc)
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


        function updateCurrentMove(towerRenderer, moveCount, tween, discArray) {

            return () => {

                let currentMove = towerRenderer.props.moveHistory[moveCount - 1];

                towerRenderer._currentMoveIndex = moveCount - 1;
                towerRenderer.setState(
                    {currentMove: currentMove});

                towerRenderer._currentTween = tween;

                if (towerRenderer._currentMovePage[towerRenderer._currentMovePage.length - 1].moveCount === moveCount) {
                    //If this is the last tween in the page, then create a new page and chain it up

                    if (towerRenderer._currentPageNo < (towerRenderer._totalPages - 1)) {

                        towerRenderer._currentPageNo++;

                        towerRenderer._currentMovePage = composePage(towerRenderer.props.moveHistory, towerRenderer._pageSize, towerRenderer._currentPageNo);

                        let prevTween = null;
                        let firstTween = null;

                        towerRenderer._currentMovePage.forEach((move, j) => {
                            let nextTween = towerRenderer.createTweenForMoveAndDisc(towerRenderer.calcThickness(), towerRenderer.getMaxDiscDiameter(),
                                discArray, move, prevTween);

                            if (j === 0) {
                                firstTween = nextTween;
                            }

                            prevTween = nextTween;
                        });

                        tween.chain(firstTween);
                    }
                }

            }

        }

        newTween.onStart(updateCurrentMove(this, move.moveCount, newTween, discArray));


        if (previousTween) {
            previousTween.chain(newTween);
        }

        return newTween;
    }


    isAnimationComplete() {
        return ((this._currentMoveIndex + 1) === this.props.moveHistory.length);
    }

    getCurrentMove() {
        return (this.state.currentMove);
    }

    isPaused() {
        return this.state.paused;
    }

    disposeThreeJS() {

        if (this._discs.length > 0) {
            this._discs.forEach(function (item) {
                item.parent.remove(item);
                item.material.dispose();
                item.geometry.dispose();
            });
            this._discs = null;
            this._discs = [];
        }

    }

    componentWillUnmount() {
        this.stop();

        TWEEN.removeAll();
        this._mount.removeChild(this._renderer.domElement);
        this.disposeThreeJS();

        this._currentTween = null;
        this._currentMovePage = null;
        this._currentPageNo = 0;

        this._renderer = null;
        this._scene = null;

        this._camera = null;

        this._mount = null;

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

        this._renderer.render(this._scene, this._camera);
        // let position = new THREE.Vector3();
        // position.setFromMatrixPosition(this.disc3.matrixWorld);

        // console.log("Cylinder position: " + position.x);
        // this.controls.update();

        TWEEN.update();

        this.frameId = window.requestAnimationFrame(this.animate);
    };


    fullScreen() {

        if (this.state.canvasHeight === '800px') {
            this.setState({canvasHeight: '400px', active: false});
        } else {
            this.setState({canvasHeight: '800px', active: true});
        }

    }

    toggleAnimation() {

        if (this.state.paused) {
            //console.log('Trying to start tween: ' + this._currentMoveIndex);
            this._currentTween.start();
        } else {
            //console.log('Trying to stop tween: ' + this._currentMoveIndex);

            this._currentTween.stop();

        }


        this.setState({paused: !this.state.paused});
    }

    render() {

        return (
            <div key={this.props.subKey + 'TowerRenderer'}>

                <Responsive key={this.props.subKey + 'TowerRendererResponsive'} {...Responsive.onlyComputer} >
                    <Menu inverted borderless size={'huge'} attached={'top'}>
                        <Menu.Item key={this.props.subKey + 'EnlargeMenu'} color='green' active={this.state.active}
                                   onClick={this.fullScreen}>Enlarge</Menu.Item>
                        <Menu.Item key={this.props.subKey + 'Pause'}
                                   disabled={this.state.currentMove.moveCount === this.props.moveHistory.length}
                                   color='green' active={this.state.paused}
                                   onClick={this.toggleAnimation}><span>{!this.state.paused ?
                            'Pause' : 'Resume'}</span></Menu.Item>
                        <Menu.Item key={this.props.subKey + 'Reset'} onClick={this.props.resetButton}>Reset</Menu.Item>
                    </Menu>

                </Responsive>

                <Segment key={this.props.subKey + 'TowerRendererSegment'} basic>
                    <Grid columns={1}>

                        <Grid.Column key={this.props.subKey + 'ColumnHanoi'}>


                            <div key={this.props.subKey + 'HanoiRenderer'}
                                 style={{
                                     height: this.state.canvasHeight,
                                     width: '100%',
                                     margin: '20px auto'
                                 }}

                                 ref={(mount) => {
                                     this._mount = mount
                                 }}
                            />


                        </Grid.Column>
                        <Grid.Column key={this.props.subKey + 'MoveStatus'}>
                            <Header
                                as={'h3'}>{this.state.currentMove.moveCount !== this.props.moveHistory.length
                                ? ("Move #" + this.state.currentMove.moveCount + " of "
                                    + this.props.moveHistory.length + " - "
                                    + "Moved disc " + this.state.currentMove.disc + " from tower " + this.state.currentMove.sourceTowerNumber + " to tower "
                                    + this.state.currentMove.targetTowerNumber) : "Completed All Moves."}</Header>
                        </Grid.Column>

                    </Grid>
                </Segment>


            </div>
        )
    }
}

export default TowerRenderer;