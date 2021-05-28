import mitt from 'mitt'

const emitter = mitt()

const events = {
    battleStart: 'onBattle',
    onBattleActorUpdate: 'onBattleActorUpdate',
    battleStartLoaded: 'onBattleStart',

    soundPlay: 'onSoundPlay',
    onWindowResize: 'onWindowResize',
    onTimeChange: 'onTimeChange',
    onGameTimeChange: 'onGameTimeChange',

    // Normal
    onItemUse: 'onItemUse',
    onItemUsed: 'onItemUsed',
    onItemCancel: 'onItemCancel',
    onItemTargetSelect: 'onItemTargetSelect',

    // Battle
    onItemTargetSelectBattle: 'onItemTargetSelectBattle',
    onBattleAnimated: 'onBattleAnimated',

    onSocketOpen: 'onSocketOpen',
    onSocketMessage: 'onSocketMessage',
    onSocketError: 'onSocketError',
    onSocketClose: 'onSocketClose'
}

window.addEventListener('resize', () => emitter.emit(events.onWindowResize))

export { emitter, events }