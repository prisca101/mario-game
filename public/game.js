const { Client, Account, Databases, ID, Query } = Appwrite
const projectId = '652910c9260e1c5949bf'
const databaseId = '65293e5f4434977384a1'
const collectionId = '65293e880e26a366cac3'

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(projectId)

const account = new Account(client)
const database = new Databases(client)

document.addEventListener('DOMContentLoaded', () => {
    displayUsername()
    showHighscore()
    showDisplay()
})
  

function validatePassword(){
    const signUpPassword = document.getElementById('sign-up-password').value
    if (signUpPassword.length < 6) {
            const passwordValidation = document.getElementById('password-validation')
            passwordValidation.textContent = "Password must be at least 6 characters."
    }
}

function isLoggedIn(){
    return account.get().then(response => {
        if (response) {
            return true
        } else {
            return false
        }
    }) .catch (error => console.error(error))
}

function getUserId(){
    return account.get().then(response => {
        return response.$id
    }) .catch (error => console.error(error))
}

// register the user
function sign_up(event){
    event.preventDefault() // prevent the page from refreshing
    // validateForm().then(isValid => {
        //if (isValid) {
            account.create(
                ID.unique(),
                event.target.elements['sign-up-email'].value, 
                event.target.elements['sign-up-password'].value, 
                event.target.elements['sign-up-username'].value
            ) .then (response => {        
                // create a document in a database
                database.createDocument(databaseId, collectionId, response.$id,
                    {
                        "userid": response.$id,
                        "highscore": 0
                    }
                )
                
                account.createEmailSession(
                    event.target.elements['sign-up-email'].value, 
                    event.target.elements['sign-up-password'].value, 
                ) .then (() => {
                    showDisplay()
                    displayUsername()
                    showHighscore()
                })
            }) .catch (error => {
                console.error(error)
                const emailValidation = document.getElementById('email-validation')
                emailValidation.textContent = "Account already exists!"
            })
        //}
    //})
}

function sign_in(event){
    event.preventDefault()
    account.createEmailSession(
        event.target.elements['sign-in-email'].value,
        event.target.elements['sign-in-password'].value
    ) .then (() => {
        showDisplay()
        displayUsername()
        showHighscore()
        client.subscribe("account", (response) => {
            console.log(response)
        })
    }) .catch (error => {
            console.error(error)
            const loginValidation = document.getElementById('login-validation')
            loginValidation.textContent = "Invalid email or password!"
        })
}

function logout(){
    account.deleteSession('current').then(() => {
        showDisplay()
    }) .catch (error => console.error(error))
}

function toggleModal(event){
    const signUp = document.getElementById('sign-up-form')
    const signIn = document.getElementById('sign-in-form')
    const signUpButton = document.getElementById('sign-up-button')
    const signInButton = document.getElementById('sign-in-button')

    if (event.srcElement.id === 'sign-up-button') {
        signUp.classList.remove('hidden')
        signIn.classList.add('hidden')
        signUpButton.classList.remove('not-active')
        signInButton.classList.add('not-active')
    } else if (event.srcElement.id === 'sign-in-button') {
        signUp.classList.add('hidden')
        signIn.classList.remove('hidden')
        signUpButton.classList.add('not-active')
        signInButton.classList.remove('not-active')
    }
}

function displayUsername(){
    account.get().then(response => {
        const usernameElement = document.getElementById('username')
        usernameElement.textContent = response.name
    }) .catch (error => console.error(error))
}

function updateHighscore(score){
    const currentHighscore = document.getElementById('highscore').textContent
    if (Number(score) > Number(currentHighscore)) {
        getUserId().then(userId => {
            database.updateDocument(
                databaseId,
                collectionId,
                userId,
                {
                    "userid": userId,
                    "highscore": score
                }
            ) .then (() => {
                showHighscore()
            }) .then (error => console.error(error))
        })
    }

    showHighscore()
}

function showHighscore(){
    getUserId() .then (userId => {
        database.listDocuments(
            databaseId,
            collectionId,
            [ Query.equal("userid", userId) ] // userId (the latter) is the one from getUserId
        ) .then (response => {
            const highscoreElement = document.getElementById('highscore')
            highscoreElement.textContent = response.documents[0].highscore
        })
    })
}

function toggleMenu() {
    const menuElement = document.getElementById('menu-container');
    menuElement.classList.toggle('hidden'); // Toggle the "hidden" class

    const menuButton = document.getElementById('menu-button');
    menuButton.removeEventListener('click', toggleMenu); // Remove previous event listener

    if (!menuElement.classList.contains('hidden')) {
        menuButton.addEventListener('click', toggleMenu); // Add a new event listener if the menu is visible
    }

    const levelButtons = document.querySelectorAll('.level');
    levelButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            play('click')
            go('game', { level: index, score: 0 });
        });
    });
}


// Sign In Menu
function showDisplay(){
    const modalElement = document.getElementById('modal')
    modalElement.classList.add('hidden')
    const menuElement = document.getElementById('menu-container');
    menuElement.classList.add('hidden')
    isLoggedIn() .then (isLogin => {
        if (isLogin) {
            const modalElement = document.getElementById('modal')
            modalElement.classList.add('hidden')
            const logoutButton = document.getElementById('logout-button')
            logoutButton.classList.remove('hidden')
            const menuButton = document.getElementById('menu-button')
            menuButton.classList.remove('hidden')
            const highscoreTag = document.getElementById('highscore-tag')
            highscoreTag.classList.remove('hidden')
            startGame()
        } else {
            const modalElement = document.getElementById('modal')
            modalElement.classList.remove('hidden')
            const logoutButton = document.getElementById('logout-button')
            logoutButton.classList.add('hidden')
            const menuButton = document.getElementById('menu-button')
            menuButton.classList.add('hidden')
            const highscoreTag = document.getElementById('highscore-tag')
            highscoreTag.classList.add('hidden')
            const username = document.getElementById('username')
            username.textContent = ""
            const canvas = document.querySelector('canvas')
            if (canvas) canvas.remove()
        }
    }) .catch (error => console.error(error))
}

// DEFINE GAME DEFINE GAME // DEFINE GAME DEFINE GAME
// DEFINE GAME DEFINE GAME // DEFINE GAME DEFINE GAME
// DEFINE GAME DEFINE GAME // DEFINE GAME DEFINE GAME
// Game from Kaboom
function startGame(){
    kaboom({
        global: true,
        fullscreen: true,
        scale: 1.8,
        clearColor: [0, 0, 0, 1]
    })

    // Speed Identifiers
    const MOVE_SPEED = 120
    const JUMP_FORCE = 360
    const SECOND_JUMP_FORCE = 260
    const BIG_JUMP_FORCE = 480
    const BIG_SECOND_JUMP_FORCE = 380
    let CURRENT_JUMP_FORCE = JUMP_FORCE
    let CURRENT_SECOND_JUMP_FORCE = SECOND_JUMP_FORCE
    const FALL_DEATH = 400
    const ENEMY_SPEED = 20
    const MUSHROOM_SPEED = 35

    // Game logic
    let isJumping = "first"

    // Music
    loadRoot('../assets/music/')
    loadSound('death', 'smb_mariodie.wav')
    loadSound('gameover', 'smb_gameover.wav')
    loadSound('win', 'smb_world_clear.wav')
    
    // Sound
    loadRoot('../assets/sfx/')
    loadSound('first_jump', 'smb_jump-small.wav')
    loadSound('second_jump', 'smb_jump-super.wav')
    loadSound('bump', 'smb_bump.wav')
    loadSound('coin', 'smb_coin.wav')
    loadSound('breakblock', 'smb_breakblock.wav')
    loadSound('powerup', 'smb_powerup.wav')
    loadSound('powerup_appears', 'smb_powerup_appears.wav')
    loadSound('pipe', 'smb_pipe.wav')
    loadSound('respawn', 'smb_fireball.wav')
    loadSound('click', 'click.wav')
      

    // Player
    loadRoot('https://i.imgur.com/')
    loadSprite('bg', 'jPJzaRT.png');
    loadSprite('coin', 'wbKxhcd.png')
    loadSprite('evil-shroom', 'KPO3fR9.png')
    loadSprite('brick', 'pogC9x5.png')
    loadSprite('block', 'M6rwarW.png')
    loadSprite('mario', 'Wb1qfhK.png')
    loadSprite('mushroom', '0wMd92p.png')
    loadSprite('surprise', 'gesQ1KP.png')
    loadSprite('unboxed', 'bdrLpi6.png')
    loadSprite('pipe-top-left', 'ReTPiWY.png')
    loadSprite('pipe-top-right', 'hj2GK4n.png')
    loadSprite('pipe-bottom-left', 'c1cYSbt.png')
    loadSprite('pipe-bottom-right', 'nqQ79eI.png')
    loadSprite('blue-block', 'fVscIbn.png')
    loadSprite('blue-brick', '3e5YRQd.png')
    loadSprite('blue-steel', 'gqVoI2b.png')
    loadSprite('blue-evil-shroom', 'SvV4ueD.png')
    loadSprite('blue-surprise', 'RMqCc1G.png')

    scene("game", ({level, score}) => {
        document.getElementById('menu-container').classList.add('hidden')
        document.getElementById('lose-container').classList.add('hidden')
        document.getElementById('win-container').classList.add('hidden')

        layers(["bg", "obj", "ui"], "obj")

        const maps = [
            [
                '                                                                           ',
                '                                           %%%%                            ',
                '                                                                           ',
                '                                                          ===              ',
                '                                                                           ',
                '     %   =*=%=                          %===%%==*=             %%%         ',
                '                                  ===                   =                  ',
                '                                                        =               -+ ',
                '                    ^   ^                             ^ =               () ',
                '==============================   ========================    ==============',
              ],
              [
                '                          %%%%                                                                  %%%%                        =',
                '                                                                                                                            =',
                '                                                                                                                            =',
                '                          ====                                                              ^              ^                =',
                '                               ==   ==                                        =======  =====================                =',
                '               %                      =           =*=%========%%===                                                         =',
                '                                         ===                           ==                                                 -+=',
                '                                                                              =                                          =()=',
                '                    ^   ^                                                   ^ =                                         ==()=',
                '=====  ==  =================   ====   =========================================                                ==============',
              ],
              [
                '                                                                                                                      ',
                '                                                                                                                      ',
                '                                                                                                                      ',
                '                                                                                                                      ',
                '                                                                                                                      ',
                '     %%%%%                                                                                                       %%%%%',
                '                                                                 ==%========%%===                                     ',
                '                                   ==                                                              -+                 ',
                '                    ^              =         =                                                 ^   ()                 ',
                '======================   ======   ==      ====    ==   ===============================    ============    ====   =====',
              ],
              [
                '£                                                                                                            £',
                '£                                                                                                xxxxxx      £',
                '£                                                                                                          x £',
                '£                                                                                                            £',
                '£  X                                                    xxx                                 z               x£',
                '£        @@@@@@              x x                   xxx                           @@@%@@@%%%%%@@              £',
                '£X                         x x x   xx   xxxxxxxx                   xxx                                       £',
                '£                        x x x x           xx                 xxx                                         x~/£',
                '£               z   z  x x x x x           xx                             xx                  z           x()£',
                '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!         !!!!                             xxx!!!!!!!!!!!!!!!!!!!!   !!!!!!!!!',
              ]
        ]

        const levelConfig = {
            width: 20, // width of each element/images
            height: 20,
            '=': [sprite('block'), solid()],
            '$': [sprite('coin'), 'coin'],
            '%': [sprite('surprise'), solid(), 'coin-surprise'],
            '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
            '}': [sprite('unboxed'), solid()],
            '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
            ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
            '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
            '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
            '^': [sprite('evil-shroom'), solid(), 'dangerous', body()],
            '#': [sprite('mushroom'), solid(), 'mushroom', body()],
            '!': [sprite('blue-block'), solid(), scale(0.5)],
            '£': [sprite('blue-brick'), solid(), scale(0.5)],
            'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
            '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
            'x': [sprite('blue-steel'), solid(), scale(0.5)],
            '~': [sprite('pipe-top-left'), solid(), scale(0.5), 'win-pipe'],
            '/': [sprite('pipe-top-right'), solid(), scale(0.5), 'win-pipe'],
        }

        const gameLevel = addLevel(maps[level], levelConfig)
        
        // Level/stage label
        add([
            text('Level ' + parseInt(level + 1)),
            pos(30, 6)
        ])

        // Scorelabel
        const scoreLabel = add([
            text(score), // displays text based on the score variable
            pos(30, 20),
            layer('ui'), // renders on a layer named 'ui'
            {
                value: score
            }
        ])

        // Player
        const player = add([
            sprite('mario', solid()),
            pos(30, 0),
            body(), // adds a physics body to the player entity
            origin('bot'), //  specifies the origin positioning, align with the ground properly
            big()
        ])

        function big(){
            let timer = 0
            let isBig = false
            return {
                update(){
                    if(isBig){
                        CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                        CURRENT_SECOND_JUMP_FORCE = BIG_SECOND_JUMP_FORCE
                        timer -= dt()
                        if(timer <= 0){
                            this.smallify()
                        }
                    }
                },

                isBig(){
                    return isBig
                },

                smallify(){
                    this.scale = vec2(1) // scale the player back to normal
                    CURRENT_JUMP_FORCE = JUMP_FORCE
                    CURRENT_SECOND_JUMP_FORCE = SECOND_JUMP_FORCE
                    timer = 0
                    isBig = false
                },

                biggify(time){
                    this.scale = vec2(1.5)
                    timer = time
                    isBig = true
                }
            }
        }

        // Environment conditions
        player.action(() => {
            camPos(player.pos) // Camera follows the player at all times
            if(player.pos.y >= FALL_DEATH){
                go('lose', {score: scoreLabel.value}) // Go to 'lose' scene
            }
        })

        player.collides('pipe', () => {
            keyPress('down', () => {
                play('pipe')
                go('game', {
                    level: (level + 1),
                    score: scoreLabel.value
                })
            })
        })

        player.collides('win-pipe', () => {
            keyPress('down', () => {
                go('win', {score: scoreLabel.value})
            })
        })
        
        player.collides('dangerous', (d) => {
            if(isJumping != "none"){
                play('bump')
                destroy(d)
                isJumping = "first"
                player.jump(CURRENT_SECOND_JUMP_FORCE)
            } else {
                go('lose', {score: scoreLabel.value})
            }
        })

        player.collides('coin', (c) => {
            play('coin')
            destroy(c)
            scoreLabel.value += 10
            scoreLabel.text = scoreLabel.value
        })

        player.collides('mushroom', (m) => {
            play('powerup')
            destroy(m)
            player.biggify(6) // how long the player will be big
        })
        
        player.on("headbump", (obj) => {
            if (obj.is('coin-surprise')) {
                play('breakblock')
                gameLevel.spawn('$', obj.gridPos.sub(0, 1)) // coin is spawn above the brick with grid position (x, y)
                destroy(obj)
                gameLevel.spawn('}', obj.gridPos.sub(0, 0)) // unboxed brick is spawn at the same position as the brick (essentially replacing the brick)
            }
            if (obj.is('mushroom-surprise')) {
                play('breakblock')
                play('powerup_appears')
                gameLevel.spawn('#', obj.gridPos.sub(0, 1)) // so basically an object is spawn above the brick object
                destroy(obj)
                gameLevel.spawn('}', obj.gridPos.sub(0, 0))
            }
        })

        // enemy movement
        action('dangerous', (d) => {
            d.move(-ENEMY_SPEED, 0) // dimension x, y
        })

        // mushroom movement
        action('mushroom', (m) => {
            m.move(MUSHROOM_SPEED, 0)
        })

        // Keyboard inputs
        keyDown('left', () => {
            player.move(-MOVE_SPEED, 0)
        })
        keyDown('right', () => {
            player.move(MOVE_SPEED, 0)
        })
        player.action(() => {
            if(player.grounded()){
                isJumping = "none"
            }
        })
        keyPress('space', () => {
            if (isJumping == "none") {
                play('first_jump')
                isJumping = "first"
                player.jump(CURRENT_JUMP_FORCE)
            } else if (isJumping == "first"){
                play('second_jump')
                isJumping = "second"
                player.jump(CURRENT_SECOND_JUMP_FORCE)
            }
        })
        keyPress('up', () => {
            if (isJumping == "none") {
                play('first_jump')
                isJumping = "first"
                player.jump(CURRENT_JUMP_FORCE)
            } else if (isJumping == "first"){
                play('second_jump')
                isJumping = "second"
                player.jump(CURRENT_SECOND_JUMP_FORCE)
            }
        })
        keyPress('r', () => {
            go('game', {level: level, score: 0})
        })

        play('respawn')

        scene('lose', ({score}) => {
            play('death')
            updateHighscore(score)
            document.getElementById('modal').classList.add('hidden')
            document.getElementById('menu-container').classList.add('hidden')
            document.getElementById('lose-container').classList.remove('hidden')

            const scoreValueElement = document.getElementById('score-value');
            scoreValueElement.textContent = score.toString();

            player.smallify()
            const restartButton = document.getElementById('restart-button');
            restartButton.addEventListener('click', () => {
                play('click')
                go('game', {level: level, score: 0})
            });

            keyPress('r', () => {
                go('game', {level: level, score: 0})
            })
        })

        scene('win', ({score}) => {
            play('win')
            updateHighscore(score)

            const finalScoreValueElement = document.getElementById('final-score-value');
            finalScoreValueElement.textContent = score.toString();

            const restartButton2 = document.getElementById('restart-button2');
            restartButton2.addEventListener('click', () => {
                play('click')
                go('game', {level: level, score: 0})
            });
        
            document.getElementById('win-container').classList.remove('hidden')

            keyPress('r', () => {
                go('game', {level: level, score: 0})
            })
        })

    })
    
    start("game", {level: 0, score: 0})

}

// SPRITE SHEETS
// SPRITE SHEETS
// SPRITE SPRITE SPRITE SPRITE
// SPRITE SPRITE SPRITE SPRITE
 
// const SPRITE_WIDTH = 30;
// const SPRITE_HEIGHT = 17;
// const BORDER_WIDTH = 0;
// const SPACING_WIDTH = 0;

// function spritePositionToImagePosition(row, col) {
//     return {
//         x: (
//             BORDER_WIDTH +
//             col * (SPACING_WIDTH + SPRITE_WIDTH)
//         ),
//         y: (
//             BORDER_WIDTH +
//             row * (SPACING_WIDTH + SPRITE_HEIGHT)
//         )
//     }
// }

// var canvas = document
//             .querySelector('canvas');
// var context = canvas
//               .getContext('2d');

// var spriteSheetURL = '../assets/img/mario_walk.png';
// var image = new Image();
// image.src = spriteSheetURL;
// image.crossOrigin = true;

// var marioRight0 = spritePositionToImagePosition(0, 0);
// var marioRight1 = spritePositionToImagePosition(0, 1);
// var marioRight2 = spritePositionToImagePosition(0, 2);
// var marioRight3 = spritePositionToImagePosition(0, 3);
// var marioLeft0 = spritePositionToImagePosition(1, 0);
// var marioLeft1 = spritePositionToImagePosition(1, 1);
// var marioLeft2 = spritePositionToImagePosition(1, 2);
// var marioLeft3 = spritePositionToImagePosition(1, 3);

// var walkCycle = [
//     marioRight0,
//     marioRight1,
//     marioRight2,
//     marioRight3
// ];

// var frameIndex = 0;
// var frame;
// function animate() {
//     // once we hit the end of the cycle,
//     // start again
//     if (frameIndex === walkCycle.length) {
//         frameIndex = 0;
//     }
//     frame = walkCycle[frameIndex];
//     context.clearRect(
//         0,
//         0,
//         canvas.width,
//         canvas.height
//     );
//     context.drawImage(
//         image,
//         frame.x,
//         frame.y,
//         SPRITE_WIDTH,
//         SPRITE_HEIGHT,
//         0,
//         0,
//         SPRITE_WIDTH,
//         SPRITE_HEIGHT
//     );
//     frameIndex += 1;
// }

// image.onload = function() {
//     setInterval(animate, 250);
// };
