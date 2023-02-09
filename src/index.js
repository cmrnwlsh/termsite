import React, {useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import 'bootswatch/dist/vapor/bootstrap.min.css'
import {useMediaQuery} from "react-responsive";
import {Col, Container, Row} from "react-bootstrap";
import Form from "react-bootstrap/Form";
import files from "./files.json";

const Terminal = () => {
    const prompt = 'user@terminal:~'
    const input = useRef('')
    const dir = useRef('home')
    const dirs = useRef(files)
    const [output, setOutput] = useState(['Enter a command, type "help" for list'])
    const line = arr => setOutput(arr.concat(output))
    const commands = {
        run: (linkname) => window.location.href = dirs.current[dir.current][linkname],

        cls: () => setOutput(['Enter a command, type "help" for list']),

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
    }

    const isMobile = useMediaQuery({query: '(max-width: 1224px)'})
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
                    <Row xs={'auto'}>
                        <Col><code>{prompt}</code></Col>
                        <Col xs={8}>
                            <Form onSubmit={event => {
                                parseCommand(input.current.value);
                                input.current.value = '';
                                event.preventDefault();
                            }}>
                                <Form.Control className={'text-secondary'}
                                              style={{
                                                  height: isMobile ? 12 : 24,
                                                  width: '99%',
                                                  fontSize: isMobile ? '.5rem' : '1rem',}}
                                              ref={input}/>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root'))
    .render(
    <React.StrictMode>
        <Terminal />
    </React.StrictMode>
);