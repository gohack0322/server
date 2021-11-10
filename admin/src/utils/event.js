import mitt from 'mitt'

const emitter = mitt()

const events = {
    onWindowResize: 'onWindowResize',
    onWindowBeforeUnload: 'onWindowBeforeUnload',
    onWindowMousemove: 'onWindowMousemove',

    onSocketConnect: 'onSocketConnect',
    onSocketRoomUpdate: 'onSocketRoomUpdate',
    onSocketCharacterUpdate: 'onSocketCharacterUpdate'
}

window.addEventListener('resize', () => emitter.emit(events.onWindowResize))
window.addEventListener('mousemove', () => emitter.emit(events.onWindowMousemove))
window.addEventListener('beforeunload', () => emitter.emit(events.onWindowBeforeUnload))

export { emitter, events }