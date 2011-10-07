halma = {};

halma.boardWidth = 9;
halma.boardHeight = 9;
halma.pieceWidth = 30;
halma.pieceHeight = 30;
halma.numberOfMoves = 0;
halma.theEnd = false;
halma.seriesJump = false;
halma.divCounter = null;

halma.initGame = function () {
    var Piece = function (row, col) {
        this.row = row;
        this.col = col;

        this.moveTo = function (other) {
            this.row = other.row;
            this.col = other.col;
        };
    };

    var initPieces = function () {
        var pieces = [
                            new Piece(halma.boardHeight - 1, 0),
                            new Piece(halma.boardHeight - 2, 0),
                            new Piece(halma.boardHeight - 3, 0),
                            new Piece(halma.boardHeight - 1, 1),
                            new Piece(halma.boardHeight - 2, 1),
                            new Piece(halma.boardHeight - 3, 1),
                            new Piece(halma.boardHeight - 1, 2),
                            new Piece(halma.boardHeight - 2, 2),
                            new Piece(halma.boardHeight - 3, 2)
//Victory speedup test
//                    new Piece(1, 0),
//                    new Piece(0, 1),
//                    new Piece(0, 2),
//                    new Piece(0, 3),
//                    new Piece(0, 4),
//                    new Piece(0, 5),
//                    new Piece(0, 6),
//                    new Piece(0, 7),
//                    new Piece(0, 8)
        ];
        return pieces;
    };

    var drawPiece = function (context, piece, selected) {
        var x, y, radius;

        context.beginPath();
        y = (piece.row * halma.pieceWidth + halma.pieceWidth / 2) + 0.5;
        x = (piece.col * halma.pieceHeight + halma.pieceHeight / 2) + 0.5;
        radius = (halma.pieceWidth / 2) * 0.9;
        context.arc(x, y, radius, /* start angle*/0, Math.PI * 2);

        context.strokeStyle = '#b33';
        context.stroke();

        if (selected) {
            context.fillStyle = '#00b';
            context.fill();
        }
        else {
            context.fillStyle = '#b33';
            context.fill();
        }
    };

    var drawBoard = function (context) {
        var i;

        context.clearRect(0, 0, halma.boardWidth * halma.pieceWidth, halma.boardHeight * halma.pieceHeight);
        context.beginPath();
        //horizontal lines
        for (i = 0; i <= halma.boardHeight * halma.pieceHeight; i += halma.pieceHeight) {
            context.moveTo(0.5, i + 0.5);
            context.lineTo(0.5 + halma.boardWidth * halma.pieceWidth, i + 0.5);
        }
        //vertical lines
        for (i = 0; i <= halma.boardWidth * halma.pieceWidth; i += halma.pieceWidth) {
            context.moveTo(i + 0.5, 0.5);
            context.lineTo(i + 0.5, halma.boardHeight * halma.pieceHeight + 0.5);
        }

        context.strokeStyle = '#777';
        context.stroke();

        //draw pieces
        for (i = 0; i < halma.pieces.length; i++) {
            drawPiece(context, halma.pieces[i], halma.selectedPiece == i);
        }


        halma.divCounter.innerHTML = "Number of moves : " + halma.numberOfMoves;

        if (halma.theEnd) {
            context.font = "bold 4em sans-serif";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText("The End", halma.pieceWidth * halma.boardWidth / 2, halma.pieceHeight * halma.boardHeight / 2);
        }
    };

    var checkTheEnd = function () {
        var i;

        for (i = 0; i < halma.pieces.length; i++) {
            if (halma.pieces[i].row > 0) {
                return;
            }
        }
        halma.theEnd = true;
        return;
    };

    var getCursorPosition = function (event) {
        var x, y;

        if (event.pageX && event.pageY) {
            x = event.pageX;
            y = event.pageY;
        }
        else {
            x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        x -= canvasElement.offsetLeft;
        y -= canvasElement.offsetTop;

        x = Math.min(x, halma.boardWidth * halma.pieceWidth);
        y = Math.min(y, halma.boardHeight * halma.pieceHeight);

        return new Piece(Math.floor(y / halma.pieceHeight), Math.floor(x / halma.pieceWidth));
    };

    var selectPiece = function (i) {
        if (i == halma.selectedPiece) {
            halma.selectedPiece = -1;
        }
        else {
            halma.selectedPiece = i;
            halma.seriesJump = false;
        }
        drawBoard(halma.context);
    };

    var singleMove = function (dx, dy) {
        return (dx <= 1) && (dy <= 1);
    };

    var jumpMove = function (dx, dy) {
        return (dx == 2 && dy == 0) || (dx == 0 && dy == 2) || (dx == 2 && dy == 2);
    };

    var pieceInMiddle = function (p1, p2) {
        var row = (p1.row + p2.row) / 2;
        var col = (p1.col + p2.col) / 2;

        var i;

        for (i = 0; i < halma.pieces.length; i++) {
            if (halma.pieces[i].row == row && halma.pieces[i].col == col)
                return true;
        }
        return false;
    };

    var movePiece = function (emptyCell) {
        var piece, dx, dy;

        if (halma.selectedPiece == -1)
            return;

        piece = halma.pieces[halma.selectedPiece];
        dx = Math.abs(emptyCell.col - piece.col);
        dy = Math.abs(emptyCell.row - piece.row);

        if (singleMove(dx, dy)) {
            piece.moveTo(emptyCell);
            halma.numberOfMoves++;
            checkTheEnd();
            drawBoard(halma.context);
            halma.seriesJump = false;
        }
        else if (jumpMove(dx, dy) && pieceInMiddle(piece, emptyCell)) {
            piece.moveTo(emptyCell);
            if (!halma.seriesJump) {
                halma.numberOfMoves++;
            }
            else {
                console.log('free move');
            }
            checkTheEnd();
            drawBoard(halma.context);
            halma.seriesJump = true;
        }
    };

    var boardClick = function (event) {
        if (halma.theEnd) return;

        var clickedCell = getCursorPosition(event);
        var i, piece;

        for (i = 0; i < halma.pieces.length; i++) {
            piece = halma.pieces[i];
            if (piece.row == clickedCell.row && piece.col == clickedCell.col) {
                selectPiece(i);
                return;
            }
        }
        movePiece(clickedCell);
        //saveGame();
    };

    var saveGame = function(){
        var state;
        if (window.localStorage){
            state = JSON.stringify(halma.pieces);
            localStorage['halma.pieces'] = state;
            localStorage['halma.numberOfMoves'] = halma.numberOfMoves;
        }
    };
    
    var resumeGame = function(){
        var i;
        if (window.localStorage && localStorage['halma.pieces']){
            halma.pieces = JSON.parse (localStorage['halma.pieces']);
            
            for (i=0; i < halma.pieces.length; i++){
                //call constructor as the serialization doesn't store the moveTo method!!!
                halma.pieces[i] = new Piece(halma.pieces[i].row, halma.pieces[i].col);
            }
            halma.numberOfMoves=parseInt(localStorage['halma.numberOfMoves']);
        }
        return false;
    };
    
    
    canvasElement = document.createElement('canvas');
    document.body.appendChild(canvasElement);

    canvasElement.width = 1 + halma.boardWidth * halma.pieceWidth;
    canvasElement.height = 1 + halma.boardHeight * halma.pieceHeight;

    halma.context = canvasElement.getContext('2d');

    canvasElement.addEventListener('click', boardClick, false);

//    if (!resumeGame()){
        halma.pieces = initPieces();
//    }
    
    halma.selectedPiece = -1;

    halma.divCounter = document.getElementById("counter");

    drawBoard(halma.context);
};

window.addEventListener('load', halma.initGame, false);
