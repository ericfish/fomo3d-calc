	var jsonData = "";
	var c = "eth-balance-";
	var t = "1h";
	var grafTitle="";
	var oldTimeOut=null;
	var domain="https://powh.trade/";
	function countdownsec(s) {
    	return new Date(s * 1e3).toISOString().slice(-10, -5);
	}
	function loadGraph(){
		google.charts.load('current', {'packages':['corechart']});
		google.charts.setOnLoadCallback(drawChartFirst);
	}
	function makeUrl()
	{
		loadData(domain + "data/" + c + t + ".json");
	}
	function loadData(u){
		jsonData = $.ajax({ url: u,
		          dataType: "json",
		          async: false
		          }).responseText;
		changeTitle();
		drawChart();
		updateFrontPage();
	}
	function updateFrontPage(){

		$.getJSON( domain + "data/last-data.json", function( data ) {
			$('#frontBalance').text(data.balance + " ETH");
			$('#frontBuy').text(data.buy + " ETH");
			$('#frontSell').text(data.sell + " ETH");
			$('#frontSupply').text(data.supply + " P3D");
			$('#lastUpdate').text(data.datetime);
			signal = data.balanceChange>0 ? '+' : ''
			$('#balance24').removeClass(signal=='+' ? colorCss='priceUp' : colorCss='priceDown');
			$('#balance24').addClass(signal=='+' ? colorCss='priceUp' : colorCss='priceDown');
			$('#balance24').text(signal + data.balanceChange + "%");
			signal = data.buyChange>0 ? '+' : ''
			$('#buy24').removeClass(signal=='+' ? colorCss='priceUp' : colorCss='priceDown');
			$('#buy24').addClass(signal=='+' ? colorCss='priceUp' : colorCss='priceDown');
			$('#buy24').text(signal + data.buyChange + "%");
			signal = data.sellChange>0 ? '+' : ''
			$('#sell24').removeClass(signal=='+' ? colorCss='priceUp' : colorCss='priceDown');
			$('#sell24').addClass(signal=='+' ? colorCss='priceUp' : colorCss='priceDown');
			$('#sell24').text(signal + data.sellChange + "%");
			signal = data.supplyChange>0 ? '+' : ''
			$('#supply24').removeClass(signal=='+' ? colorCss='priceUp' : colorCss='priceDown');
			$('#supply24').addClass(signal=='+' ? colorCss='priceUp' : colorCss='priceDown');
			$('#supply24').text(signal + data.supplyChange + "%");
		});
		if(oldTimeOut) clearTimeout(oldTimeOut);
		oldTimeOut = setTimeout(makeUrl, 300000); //5m
	}
	function changeTitle()
	{
		var str="";
		switch(c)
		{
			case "eth-balance-":
			str+="ETH Balance ";
			break;
			case "buy-":
			str+="Buy Price (ETH) ";
			break;
			case "sell-":
			str+="Sell Price (ETH) ";
			break;
			case "supply-":
			str+="Total PoWH Supply ";
			break;

		}
		grafTitle = str+" - "+t+"";
		//$('#chart_title').text(grafTitle);
	}
	function drawChartFirst() {
		loadData(domain + "data/eth-balance-1h.json");
	}
	function drawChart() {
	        var data = new google.visualization.DataTable(jsonData);
			var formatter = new google.visualization.NumberFormat(
			    {fractionDigits: '6', negativeColor: 'red', negativeParens: true});
			formatter.format(data, 1);
			formatter.format(data, 2);
			formatter.format(data, 3);
			formatter.format(data, 4);
			formatter.format(data, 5);
			    var options = {
				  explorer: { actions: ['dragToZoom', 'rightClickToReset'] },
			      legend:'none',
			      backgroundColor:{fill: '#303030'},
			      chartArea: {backgroundColor: '#303030',left: 10, right: 10, top: 40,height:500},
			      //colors: ['red','green','blue'],
			      crosshair: { trigger: 'both', focused: { color: '#666', opacity: 0.8 }},
			      curveType: 'function',
			      title: grafTitle,
			      titleTextStyle: {color: '#CCC', fontName: 'Roboto, Helvetica Neue, Arial, sans-serif', fontSize: 25, bold:true},
			      vAxis: {
			      	gridlines: {color: '#111', count: 6},
				  	minorGridlines: {color: '#222', count: 1},
				  	textPosition: 'in',
				  	textStyle: {color: '#AAA', fontName: 'Roboto, Helvetica Neue, Arial, sans-serif', fontSize: 10}
			      },
			      hAxis: {
				  	textPosition: 'in',
				  	textStyle: {color: '#AAA', fontName: 'Roboto, Helvetica Neue, Arial, sans-serif', fontSize: 10}
			      },
			      tooltip: {
				  	textStyle: {color: '#666', fontName: 'Roboto, Helvetica Neue, Arial, sans-serif', fontSize: 12}
			      },
			      animation:{
				  	duration: 1000,
				  	easing: 'out',
				  	startup: true
				  },
				  //legend: {position:'in'},
				  candlestick: {fallingColor:{fill:'#FF6939',stroke:'#FF6939',strokeWidth:3},risingColor:{fill:'#69C05A',stroke:'#69C05A',strokeWidth:3}},
				  series: {1: {type: 'line', color: '#CCC'}},
				  seriesType: 'candlesticks'
			    };
			var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
			chart.draw(data, options);
			document.getElementById('updateFeedback').innerHTML="Updated @ " + moment().format("HH:mm:ss");
	}

	$(document).ready(function(){
		// só se estiver no myPowh
		if(document.getElementById('inputAddress')){
			$("#trackButton").show();
			var cookie = Cookies.get('addr');
			if(cookie && document.getElementById('inputRemember'))
			{
				document.getElementById('inputRemember').checked=true;
				document.getElementById('inputAddress').value=cookie;
			}

			startWeb3();

			//$("#trackButton").hide();
			$("#trackButton").click(function(){
				refreshData();
			});
		}
	});

	var web3;
	var isMetaMask = false;
	var balance = 0;
	var dividens = 0;
	var buyP = 0;
	var sellP = 0;
	var ethB = 0;
	var supplyB = 0;
	var addr=null;
	var tokenContract=null;
	var contractAddr = '0xB3775fB83F7D12A36E0475aBdD1FCA35c091efBe';
	var abi = [{"constant":true,"inputs":[{"name":"_customerAddress","type":"address"}],"name":"dividendsOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_ethereumToSpend","type":"uint256"}],"name":"calculateTokensReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokensToSell","type":"uint256"}],"name":"calculateEthereumReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"onlyAmbassadors","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"administrators","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"sellPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"stakingRequirement","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_includeReferralBonus","type":"bool"}],"name":"myDividends","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalEthereumBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_customerAddress","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_amountOfTokens","type":"uint256"}],"name":"setStakingRequirement","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"buyPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_identifier","type":"bytes32"},{"name":"_status","type":"bool"}],"name":"setAdministrator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"myTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"disableInitialStage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_toAddress","type":"address"},{"name":"_amountOfTokens","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_symbol","type":"string"}],"name":"setSymbol","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"string"}],"name":"setName","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_amountOfTokens","type":"uint256"}],"name":"sell","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"exit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_referredBy","type":"address"}],"name":"buy","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"reinvest","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"customerAddress","type":"address"},{"indexed":false,"name":"incomingEthereum","type":"uint256"},{"indexed":false,"name":"tokensMinted","type":"uint256"},{"indexed":true,"name":"referredBy","type":"address"}],"name":"onTokenPurchase","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"customerAddress","type":"address"},{"indexed":false,"name":"tokensBurned","type":"uint256"},{"indexed":false,"name":"ethereumEarned","type":"uint256"}],"name":"onTokenSell","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"customerAddress","type":"address"},{"indexed":false,"name":"ethereumReinvested","type":"uint256"},{"indexed":false,"name":"tokensMinted","type":"uint256"}],"name":"onReinvestment","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"customerAddress","type":"address"},{"indexed":false,"name":"ethereumWithdrawn","type":"uint256"}],"name":"onWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"}];

	function startWeb3()
	{
		if (typeof web3 !== 'undefined') {
			isMetaMask = web3.currentProvider.isMetaMask;
		}
		if(!isMetaMask){
			web3 = require('web3');
			web3 = new web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/iNsD6n8SDVGk99Ih09Gp'));
		}
		else
		{
			//e metamask mostra botoes
			$("#btReinvest").show();
			$("#btWithdraw").show();
		}


		tokenContract = web3.eth.contract(abi).at(contractAddr);

		refreshData();
	}

	function refreshData(justWait = true){

		let lastTime =	parseInt(localStorage.getItem("lastquery"))+30;
		if(justWait && lastTime > Date.now()/1000){
			document.getElementById('addressFeedback').innerHTML = 'Please wait ' + countdownsec(lastTime - Date.now()/1000) + ' before you make another query!<br><br>' ;
			gtag('event', 'see_tokens',{'event_category': 'click','event_label': 'P3D Refresh Error'});
			return;
		}
		document.getElementById('updateFeedback').innerHTML="<img src='images/ripple.gif'>";

		if(isMetaMask) {
			addr = web3.eth.accounts[0];
			if(addr!=undefined){
				document.getElementById('inputAddress').value = addr;
				document.getElementById('addressFeedback').innerText = '';
			}
			else
			{
				document.getElementById('inputAddress').value = "MetaMask Detected!";
				document.getElementById('addressFeedback').innerText = 'Please login on MetaMask or wait that MetaMask loads your wallet!';
			}
		}
		else{
			addr = document.getElementById('inputAddress').value;
		}

		//if(addr=="") addr = document.getElementById('inputAddress').value;

		//$("#trackButton").hide();
		$('#dBalance').html("0 ETH");
		$('#tBalance').html("0 P3D");
		$('#tBalanceEth').html("≈ 0 ETH");
		$('#mBalance').html("0 ETH");
		$('#aBalance').html("0 ETH");
		$('#sellP').html("0 ETH")
		$('#buyP').html("0 ETH")
		$('#ethBalance').html("0 ETH");
		$('#tSupply').html("0 P3D");

		if(isMetaMask){
			$("#btReinvest").hide();
			$("#btWithdraw").hide();
		}
		sellPrice();
		buyPrice();
		totalEthereumBalance();
		totalSupply();
		setTimeout(refreshData, 300000); //5m
		localStorage.setItem("lastquery", Date.now()/1000);
	}

	function trackTokens(){
		if(web3.isAddress(addr) && !isMetaMask)
		{
			document.getElementById('addressFeedback').innerText = '';
			if(document.getElementById('inputRemember').checked){
				Cookies.set('addr', addr, { expires: 7 });
				gtag('event', 'see_tokens',{'event_category': 'click','event_label': 'with_saved_address'});
			}
			else
			{
				Cookies.remove('addr');
				gtag('event', 'see_tokens',{'event_category': 'click','event_label': 'without_saved_address'});
			}
			web3.eth.defaultAccount = addr;
			dividendsOf();
			balanceOf();
			//test();
		}
		else if(isMetaMask){
			gtag('event', 'see_tokens',{'event_category': 'click','event_label': 'with_metamask'});
			dividendsOf();
			balanceOf();
		}
		else if(addr!="")
		{
			document.getElementById('addressFeedback').innerText = 'Invalid ETH Address.';
			gtag('event', 'see_tokens',{'event_category': 'click','event_label': 'with_invalid_address'});
		}
	}
	var normal_dividens = 0;
	var master_dividens = 0;

	function dividendsOf(){
		tokenContract.dividendsOf(web3.eth.defaultAccount, function(error, result){
		    if(!error){
		        var tokens = web3.toDecimal(result).toString();
		        normal_dividens = tokens;
				$('#dBalance').html(Number(web3.fromWei(tokens, 'ether')).toFixed(6) + " ETH");
				myDividends();
			}
		    else{
		        $('#dBalance').html(error);
		    }
		});
	}

	function balanceOf(){
		tokenContract.balanceOf(addr, function(error, result){
		    if(!error){
		        var tokens = web3.toDecimal(result).toString();
		        var p3dBal = web3.fromWei(tokens, 'ether');
		        $('#tBalance').html( Number(p3dBal).toFixed(6) + " P3D");
		        calculateEthereumReceived(web3.toWei(p3dBal, 'ether'));
			}
		    else{
		        $('#tBalance').html(error);
		    }
		});
	}

	function myDividends(){
		tokenContract.myDividends(true, function(error, result){
		    if(!error){
		        var tokens = web3.toDecimal(result).toString();
		        master_dividens =  tokens - normal_dividens;
		        var allDivs = web3.fromWei(tokens, 'ether');
				if(allDivs < 0.0001) {
					$("#btReinvest").hide();
					$("#btWithdraw").hide();
		        }
		        else if(isMetaMask){
					calculateTokensReceived(web3.toWei(allDivs, 'ether'));
			    }

				$('#mBalance').html(Number(web3.fromWei(master_dividens, 'ether')).toFixed(6) + " ETH");
				$('#aBalance').html(Number(allDivs).toFixed(6) + " ETH");
				document.getElementById('updateFeedback').innerHTML="Updated @ " + moment().format("HH:mm:ss YYYY-MM-DD");
			}
		    else{
		        $('#mBalance').html(error);
		        $('#aBalance').html(error);
		    }
		});
	}

	function calculateTokensReceived(eth){
		tokenContract.calculateTokensReceived(eth, function(error, result){
		    if(!error){
		        var tokens_received = web3.toDecimal(result).toString();
		        document.getElementById("btReinvest").value = "Reinvest ≈ "+ Number(web3.fromWei(tokens_received, 'ether')).toFixed(3) +" P3D";
				$("#btReinvest").show();
				$("#btWithdraw").show();
			}
		    else{
		        console.log(error);
		    }
		});
	}
	function calculateEthereumReceived(tokens){
		tokenContract.calculateEthereumReceived(tokens, function(error, result){
		    if(!error){
		        var tokens_received = web3.toDecimal(result).toString();
		        $('#tBalanceEth').html("≈ " + Number(web3.fromWei(tokens_received, 'ether')).toFixed(6) + " ETH");
			}
		    else{
		        console.log(error);
		    }
		});

	}

	function sellPrice(){
		tokenContract.sellPrice(function(error, result){
		    if(!error){
			    var tokens = web3.toDecimal(result).toString();
				sellP = web3.fromWei(tokens, 'ether');
				$('#sellP').html(Number(sellP).toFixed(6) + " ETH");
				trackTokens();
			}
		    else{
			    $('#sellP').html(error);
		    }
		});
	}
	function buyPrice(){
		tokenContract.buyPrice(function(error, result){
		    if(!error){
			    var tokens = web3.toDecimal(result).toString();
				buyP = web3.fromWei(tokens, 'ether');
				$('#buyP').html(Number(buyP).toFixed(6) + " ETH");
			}
		    else{
   			    $('#buyP').html(error);
		    }
		});
	}
	function totalEthereumBalance(){
		tokenContract.totalEthereumBalance(function(error, result){
		    if(!error){
			    var tokens = web3.toDecimal(result).toString();
				ethB = web3.fromWei(tokens, 'ether');
				$('#ethBalance').html(Number(ethB).toFixed(6) + " ETH");
				//$("#trackButton").show();
			}
		    else{
			    $('#ethBalance').html(error);
		    }
		});
	}
	function totalSupply(){tSupply
		tokenContract.totalSupply(function(error, result){
		    if(!error){
			    var tokens = web3.toDecimal(result).toString();
				supplyB = web3.fromWei(tokens, 'ether');
				$('#tSupply').html(Number(supplyB).toFixed(6) + " P3D");
			}
		    else{
			    $('#tSupply').html(error);
		    }
		});
	}

	function reinvest(){
		if(!isMetaMask){
			alert("Please Install Metamask!")
			return;
		}
		else
		{
			buyPrice();
			$('#myModal').find('.modal-body').text('Would you like to reinvest your outstanding earnings @ ≈'+buyP+' ETH / PD3 token?');
			$('#myModal').modal('show');
			$("#btnModalConfirm").on("click", function(){
				$("#myModal").modal('hide');
				tokenContract.reinvest(function(error, result){
				    if(!error){
					    gtag('event', 'reinvest',{'event_category': 'click','event_label': 'success'});
					    alert("Transaction have been submitted to the Ethereum network!");
					}
				    else{
					    gtag('event', 'reinvest',{'event_category': 'click','event_label': 'error'});
					    console.log("Reinvest ERROR: "+ error);
				    }
			    });

  			});
		}
	}

	function withdraw(){
		if(!isMetaMask){
			alert("Please Install Metamask!")
			return;
		}
		else
		{
			$('#myModal').find('.modal-body').text('Would you like to withdraw all your outstanding earnings?');
			$('#myModal').modal('show');
			$("#btnModalConfirm").on("click", function(){
				$("#myModal").modal('hide');
				tokenContract.withdraw(function(error, result){
				    if(!error){
					    gtag('event', 'withdraw',{'event_category': 'click','event_label': 'success'});
					    alert("Transaction have been submitted to the Ethereum network!");
					}
				    else{
					    gtag('event', 'withdraw',{'event_category': 'click','event_label': 'error'});
					    console.log("Reinvest ERROR: "+ error);
				    }
			    });

  			});
		}
	}


