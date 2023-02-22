import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import 'bootswatch/dist/vapor/bootstrap.min.css'
import {useMediaQuery} from "react-responsive";
import files from "./files.json";
import {Col, Container, Form, Row} from "react-bootstrap";

const TrieNode = function (key) {
    this.key = key;
    this.parent = null;
    this.children = {};
    this.end = false

    this.getWord = () => {
        let output = [];
        let node = this;

        while (node !== null) {
            output.unshift(node.key);
            node = node.parent;
        }

        return output.join('');
    }
}

const Trie = function () {
    this.root = new TrieNode(null)

    this.insert = word => {
        let node = this.root;

        for (const [i, char] of Array.from(word).entries()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode(char);
                node.children[char].parent = node;
            }

            node = node.children[char];

            if (i === word.length - 1)
                node.end = true;
        }
    }

    this.find = prefix => {
        let node = this.root;
        let output = [];

        for (const char of prefix) {
            if (node.children[char])
                node = node.children[char]
            else
                return output
        }

        findAllWords(node, output);
        return output;
    }

    const findAllWords = (node, arr) => {
        if (node.end) {
            arr.unshift(node.getWord());
        }

        for (const child in node.children)
            findAllWords(node.children[child], arr)
    }
}

const Terminal = () => {
    const prompt = 'user@terminal:~';
    const input = useRef('');
    const dir = useRef('home');
    const dirs = useRef(files);
    const [output, setOutput] = useState(['Enter a command, type "help" for list,' +
    ' press tab for autocomplete']);
    const line = arr => setOutput(arr.concat(output))

    const commands = {
        run: (linkname) => window.location.href = dirs.current[dir.current][linkname],

        cls: () => setOutput(['Enter a command, type "help" for list, press tab for autocomplete']),

        cat: filename => filename.slice(filename.length - 4) === '.txt' && filename in dirs.current[dir.current] ?
            line([...dirs.current[dir.current][filename].reverse().map(x => '  ' + x), `cat ${filename}:`]) :
            line(['  not a valid filename', `cat ${filename}:`]),

        ls: () => line(['  ' + Object.keys(dirs.current[dir.current]).join(' '), 'ls: ']),

        help: () => line([
            '  ls- list dir contents',
            '  cat- read contents of a text file',
            '  cls- clear screen',
            '  use ./"link" to follow a link',
            'help:'])
    }

    const commandTrie = new Trie()
    const fileTrie = new Trie()

    for (const command of Object.keys(commands))
        commandTrie.insert(command)

    for (const file of Object.keys(dirs.current[dir.current]))
        fileTrie.insert(file)

    const autocomplete = () => {
        const tokens = input.current.value.split(' ').filter(x => x)
        if (tokens.length === 1)
            if (tokens[0].slice(0, 2) === './') {
                const result = fileTrie.find(input.current['value'].slice(2))
                    .filter(x => x.slice(-4) !== '.txt');
                if (result.length > 1)
                    line(['  ' + result.join(' ')]);
                else if (result.length)
                    input.current['value'] = './' + result;
            }
            else if (tokens[0] === 'cat') {
                const result = fileTrie.find('').filter(x => x.slice(-4) === '.txt')
                line(['  ' + result.join(' ')])
            }
            else {
                const result = commandTrie.find(tokens[0])
                if (result.length > 1)
                    line(['  ' + result.join(' ')]);
                else if (result.length)
                    input.current['value'] = result;
            }
        else if (tokens.length === 2)
            if(tokens[0] === 'cat') {
                const result = fileTrie.find(tokens[1])
                if (result.length > 1)
                    line(['  ' + result.join(' ')]);
                else if (result.length)
                    input.current['value'] = tokens[0] + ' ' + result
            }

    }

    const parseCommand = text => {
        const command = text.split(' ');
        if (command[0].slice(0, 2) === './')
            command[0].slice(2) in dirs.current[dir.current] &&
            !command[0].slice(2).includes('.') ?
                commands['run'](command[0].slice(2)) :
                line([`not a link: ${command[0].slice(2)}`])

        else command[0] in commands ?
            commands[command[0]](...command.slice(1)) :
            line([`command not recognized: ${command}`]);

        input.current['value'] = '';
    }

    const isMobile = useMediaQuery({query: '(max-width: 1224px)'})

    useEffect(() => {
        const documentClick = event => {
            if (input.current && event.target !== input.current) {
                input.current.focus();
                event.preventDefault();
            }
        }
        document.addEventListener('mousedown', documentClick)

        return () => {
            document.removeEventListener('mousedown', documentClick)
        }
    }, [input]);

    return (
        <div style={{height: '100vh', fontSize: isMobile ? '.5rem' : '1rem'}}>
            <div className={'mx-auto shadow-lg pb-5 mb-5 ml-5 bg-dark rounded'}
                 style={{
                     height: '75vh',
                     width: '75vw',
                     minWidth: 380
                 }}>
                <Container className={'mb-3'}
                           style={{
                               height: '99%',
                               overflow: 'scroll',
                               display: 'flex',
                               flexDirection: 'column-reverse',
                               whiteSpace: 'pre-wrap'
                           }}>
                    {Array.from(output).map(line =>
                        <Row><code className={'text-success'}>{line}</code></Row>)}
                </Container>
                <Container>
                    <Form
                        onKeyDown={event => {
                            if (event.key === "Tab") {
                                autocomplete();
                                event.preventDefault();
                            }
                        }}
                        onSubmit={event => {
                            parseCommand(input.current.value);
                            event.preventDefault();
                        }}>
                        <Form.Group as={Row} className={'text-success'}>
                            <Form.Label
                                column xs={1}
                                style={{
                                    width: isMobile ? '3.1rem' : '6.8rem'
                                }}>{prompt}
                            </Form.Label>
                            <Col
                                style={{
                                    display: 'flex',
                                    flexWrap: 'nowrap'
                                }}>
                                <Form.Control
                                    maxLength={80}
                                    className={'shadow-none text-success'}
                                    style={{
                                        fontSize: isMobile ? '.5rem' : '1rem',
                                        background: 'transparent',
                                        border: 'none'
                                    }}
                                    ref={input}/>
                            </Col>
                        </Form.Group>
                    </Form>
                </Container>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root'))
    .render(
        <React.StrictMode>
            <Terminal/>
        </React.StrictMode>
    );