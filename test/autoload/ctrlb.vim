
let s:suite = themis#suite('ctrlb')
let s:assert = themis#helper('assert')

function! s:suite.before()
    let s:root = CtrlbTestBefore()
endfunction

function! s:suite.after_each()
    call CtrlbTestAfterEach()
endfunction

function! s:suite.open()
    call ctrlb#open('empty')

    call s:assert.equals(expand('%:p'), 'ctrlb://empty')
    call s:assert.equals(&filetype, 'ctrlb-empty')
endfunction

function! s:suite.open_layout()
    call ctrlb#open_layout('./test/autoload/layout.json')

    call s:assert.equals(expand('%:p'), 'ctrlb://empty')
    call s:assert.equals(&filetype, 'ctrlb-empty')
endfunction

function! s:suite.do_action()
    call ctrlb#do_action('empty', '_test')
endfunction

function! s:suite._complete()
    let result = ctrlb#_complete('', 'CtrlbOpen ', 10)

    call s:assert.is_string(result)
endfunction

" NOTICE: needs to setup bin/wsxhub, bin/wsxhubd
function! s:suite.ping()
    call ctrlb#config#set('server_port', 8009)
    call ctrlb#config#set('port', 8010)

    let result = ctrlb#ping()
    call s:assert.equals(result, v:false)

    call ctrlb#start_server()
    let result = ctrlb#ping()
    try
        call s:assert.equals(result, v:true)
    finally
        call ctrlb#stop_server()
    endtry

    let result = ctrlb#ping()
    call s:assert.equals(result, v:false)
endfunction
