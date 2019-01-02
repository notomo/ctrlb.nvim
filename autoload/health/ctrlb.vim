
function! health#ctrlb#check() abort
    call health#report_start('ctrlb.nvim')

    let ok = s:check_client()
    if ok
        call s:check_server()
    endif

    call s:check_ts_build()
endfunction

let s:project_root = expand('<sfile>:p:h:h:h')
let s:test_project_root = ''
let s:test_client = ''

function! s:check_client() abort
    let client = empty(s:test_client) ? ctrlb#config#get('executable_client') : s:test_client
    if executable(client)
        call health#report_ok('The client command exists. Path: ' . fnamemodify(client, ':~'),)
        return v:true
    endif

    call health#report_error('The client command does not exist.', [
        \ 'npm run setup',
        \ '  OR',
        \ "Download the binary from https://github.com/notomo/wsxhub/releases/latest to $PATH and :call ctrlb#config#set('executable_client', 'wsxhub')",
        \ '  OR',
        \ "go get -u github.com/notomo/wsxhub/... and :call ctrlb#config#set('executable_client', 'wsxhub')"
    \ ])
    return v:false
endfunction

function! s:check_server() abort
    if ctrlb#ping()
        call health#report_ok('The server is running.')
    else
        call health#report_warn('Failed to communicate with the server.', [
            \ ':call ctrlb#start_server()',
        \ ])
    endif
endfunction

function! s:check_ts_build() abort
    let project_root = empty(s:test_project_root) ? s:project_root : s:test_project_root
    let version_file = project_root . '/lib/version'

    let s:advice = [
        \ 'cd ' . fnamemodify(project_root, ':~'),
        \ 'npm run setup',
        \ 'Execute :UpdateRemotePlugins on neovim and restart neovim',
    \ ]

    if !filereadable(version_file)
        call health#report_error('There are no compiled files. Please execute the following commands.', s:advice)
        return
    endif

    let built_version = join(readfile(version_file), '')

    let package_json = join(readfile(project_root . '/package.json'), '')
    let package_version = json_decode(package_json)['version']
    if built_version ==? package_version
        call health#report_ok('The compiled files are up to date. Version: ' . package_version)
    else
        call health#report_warn('The compiled files are outdated. Please execute the following commands.', s:advice)
    endif
endfunction

function! health#ctrlb#_set_test_path(path) abort
    let s:test_project_root = a:path
endfunction

function! health#ctrlb#_set_test_client(path) abort
    let s:test_client = a:path
endfunction
