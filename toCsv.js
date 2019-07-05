//https://www.aconvert.com/pdf/pdf-to-csv/

var fs = require('fs');

// const path = 'full_pdf.txt';
const path = 'pdf.txt';
fs.readFile(path, 'utf8', (err, contents) => {
	if (err) {
		console.log('Erro ao ler o arquivo ', err);
		return;
	}

	let re1 = new RegExp('--- ', 'g');
	let data = contents.replace(re1, '---\n');
	data = corrigirErrosFormatacao(data);

	let rows = data.split('\n');

	let table = [];
	rows.forEach((row, index) => {
		//separando primeira coluna do resto
		const [firstColumn, ...rest] = row.split(' ');

		//tratando quebra de linhas indevidas no arquivo
		console.log(`Index: ${index}\n`);
		const parse = parseInt(firstColumn);
		// console.log(parse);
		console.log(row);
		if (isNaN(parse)) {
			if (index > 0) {
				for (let j = index; j > 0; j--) {
					if (table[j]) {
						const r = table[j];
						r[r.length - 1] += ' ' + row;
						table[j] = r;
						break;
					}
				}
			}
		} else {
			//separando segunda coluna
			const split1 = splitFirstUpperCaseSentence(rest);
			const secondColumn = split1.sentence;
			const rest2 = split1.rest;

			let thirdColumn = '';
			let fourthColumn = '';
			let lastColumn = '';
			if (rest2.length > 0) {
				//resgatando as ultimas colunas quebrando na resposta SIM/NAO
				const split2 = splitAns(rest2);
				thirdColumn = split2.previousCol;
				fourthColumn = split2.currentCol;
				lastColumn = split2.nextCol;
			} else {
				const split2 = splitAns(secondColumn.split(' '));

				const wordsColumn2 = secondColumn.split(' ');
				const lastWordcoulumn2 = wordsColumn2[wordsColumn2.length - 1];

				thirdColumn = lastWordcoulumn2;
				fourthColumn = split2.currentCol;
				lastColumn = split2.nextCol;
			}

			const tableRow = [
				firstColumn.trim(),
				secondColumn.trim(),
				thirdColumn.trim(),
				fourthColumn.trim(),
				lastColumn.trim()
			];
			table.push(tableRow);
		}
	});

	console.log(`Tabela com ${table.length} linhas`);

	writeCsvFile(table);
});

function corrigirErrosFormatacao(data) {
	re1 = new RegExp('\r', 'g');
	data = data.replace(re1, '');

	re1 = new RegExp('etcSIM', 'g');
	data = data.replace(re1, 'etc SIM ');

	re1 = new RegExp('etcNÃO', 'g');
	data = data.replace(re1, 'etc NÃO ');

	re1 = new RegExp('SESSÕES', 'g');
	data = data.replace(re1, 'SESSÕES ');

	re1 = new RegExp('LÁBIO', 'g');
	data = data.replace(re1, 'LÁBIO ');

	re1 = new RegExp('BOCA', 'g');
	data = data.replace(re1, 'BOCA ');

	re1 = new RegExp('MAMAS', 'g');
	data = data.replace(re1, ' MAMAS ');

	re1 = new RegExp('FACE', 'g');
	data = data.replace(re1, 'FACE ');

	re1 = new RegExp('PESCOÇO', 'g');
	data = data.replace(re1, 'PESCOÇO ');

	re1 = new RegExp('LARINGE', 'g');
	data = data.replace(re1, ' LARINGE ');

	re1 = new RegExp('ANTERIOR', 'g');
	data = data.replace(re1, ' ANTERIOR ');

	re1 = new RegExp('CILIAR', 'g');
	data = data.replace(re1, ' CILIAR ');

	re1 = new RegExp('EXTERNA', 'g');
	data = data.replace(re1, ' EXTERNA ');

	re1 = new RegExp('INTERNA', 'g');
	data = data.replace(re1, ' INTERNA ');

	re1 = new RegExp('cirúrgicoSIM', 'g');
	data = data.replace(re1, 'cirúrgico SIM');

	re1 = new RegExp('intermaxilarSIM', 'g');
	data = data.replace(re1, 'intermaxilar SIM');

	re1 = new RegExp('antebraçoSIM', 'g');
	data = data.replace(re1, 'antebraço SIM');

	re1 = new RegExp('videolaparoscopiaNÃO', 'g');
	data = data.replace(re1, 'videolaparoscopia NÃO');

	re1 = new RegExp('uterinoSIM', 'g');
	data = data.replace(re1, 'uterino SIM');

	re1 = new RegExp('alta\\)NÃO', 'g');
	data = data.replace(re1, 'alta) NÃO');

	re1 = new RegExp('viaSIM', 'g');
	data = data.replace(re1, 'via SIM');

	re1 = new RegExp('intervencionistaNÃO', 'g');
	data = data.replace(re1, 'intervencionista NÃO');

	re1 = new RegExp('orgânicosSIM', 'g');
	data = data.replace(re1, 'orgânicos SIM');

	re1 = new RegExp('intervencionistaSIM', 'g');
	data = data.replace(re1, 'intervencionista SIM');

	re1 = new RegExp('dosagemSIM', 'g');
	data = data.replace(re1, 'dosagem SIM');

	re1 = new RegExp('venosaSIM', 'g');
	data = data.replace(re1, 'venosa SIM');

	re1 = new RegExp('tratamentoSIM', 'g');
	data = data.replace(re1, 'tratamento SIM');

	re1 = new RegExp('diaNÃO', 'g');
	data = data.replace(re1, 'dia NÃO');

	re1 = new RegExp('coordenação\\)NÃO', 'g');
	data = data.replace(re1, 'coordenação) NÃO');

	re1 = new RegExp(
		'Tabela de correlação entre a Terminologia Unificada da Saúde Suplementar (ver 1.0.2) e o Rol de Procedimentos e Eventos em Saúde (RN nº 262/2011 alterada pela RN nº 281/2011)',
		'g'
	);
	data = data.replace(re1, '');

	re1 = new RegExp(
		`CÓDIGO
TUSS GRUPO - SUBGRUPO - TUSS PROCEDIMENTO - TUSS ROL ANS ROL ANS Resolução Normativa nº 262,/2011 alterada pela Resolução Normativa nº 281/2011`,
		'g'
	);
	data = data.replace(re1, '');

	re = new RegExp(/Pag. d+/, 'g');
	data = data.replace(re1, '');

	re1 = new RegExp('  ', 'g');
	data = data.replace(re1, ' ');

	return data;
}

function isUpperCase(str) {
	return str && str === str.toUpperCase();
}

function splitAns(words = []) {
	for (let i = words.length; i > 0; i--) {
		if (words[i] === 'SIM' || words[i] === 'NÃO') {
			return {
				currentCol: words[i],
				previousCol: words.slice(0, i).join(' '),
				nextCol: words.slice(i + 1, words.length).join(' ')
			};
		}
	}
}

function splitFirstUpperCaseSentence(words) {
	let sentence = '';
	let i = 0;
	for (word of words) {
		if (isUpperCase(word)) {
			sentence = `${sentence} ${word}`;
		} else {
			break;
		}
		i++;
	}

	const rest = words.slice(i);

	return { sentence, rest };
}

function writeCsvFile(table = [], path = 'output.csv') {
	var file = fs.createWriteStream(path);
	file.on('error', function(err) {
		/* error handling */
	});
	table.forEach(function(row) {
		file.write(row.join('\t') + '\n');
	});
	file.end();
}
