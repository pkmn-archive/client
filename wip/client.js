{
  /**
   * Sends a decision; pass it an array of choices like ['move 1', 'switch 2']
   * and it'll send `/choose move 1,switch 2|3`
   * (where 3 is the rqid).
   *
   * (The rqid helps verify that the decision is sent in response to the
   * correct request.)
   */
  sendDecision: function (message) {
    if (!$.isArray(message)) return this.send('/' + message + '|' + this.request.rqid);
    var buf = '/choose ';
    for (var i = 0; i < message.length; i++) {
      if (message[i]) buf += message[i] + ',';
    }
    this.send(buf.substr(0, buf.length - 1) + '|' + this.request.rqid);
  },
    request: null,
    receiveRequest: function (request, choiceText) {
      if (!request) {
        this.side = '';
        return;
      }
      request.requestType = 'move';
      if (request.forceSwitch) {
        request.requestType = 'switch';
      } else if (request.teamPreview) {
        request.requestType = 'team';
      } else if (request.wait) {
        request.requestType = 'wait';
      }

      var choice = null;
      if (choiceText) {
        choice = {waiting: true};
      }
      this.choice = choice;
      this.finalDecision = this.finalDecisionMove = this.finalDecisionSwitch = false;
      this.request = request;
      //if (request.side) {
      //this.updateSideLocation(request.side);
      //}
      //this.notifyRequest();
      //this.updateControls(true);
    },
    init: function (data) {
      var log = data.split('\n');
      if (data.substr(0, 6) === '|init|') log.shift();
      if (log.length && log[0].substr(0, 7) === '|title|') {
        this.title = log[0].substr(7);
        log.shift();
        app.roomTitleChanged(this);
      }
      if (this.battle.activityQueue.length) return;
      this.battle.activityQueue = log;
      this.battle.fastForwardTo(-1);
      this.battle.play();
      if (this.battle.ended) this.battleEnded = true;
      this.updateLayout();
      this.updateControls();
    },
    add: function (data) {
      if (!data) return;
      if (data.substr(0, 6) === '|init|') {
        return this.init(data);
      }
      if (data.substr(0, 9) === '|request|') {
        data = data.slice(9);

        var requestData = null;
        var choiceText = null;

        var nlIndex = data.indexOf('\n');
        if (/[0-9]/.test(data.charAt(0)) && data.charAt(1) === '|') {
          // message format:
          //   |request|CHOICEINDEX|CHOICEDATA
          //   REQUEST

          // This is backwards compatibility with old code that violates the
          // expectation that server messages can be streamed line-by-line.
          // Please do NOT EVER push protocol changes without a pull request.
          // https://github.com/Zarel/Pokemon-Showdown/commit/e3c6cbe4b91740f3edc8c31a1158b506f5786d72#commitcomment-21278523
          choiceText = '?';
          data = data.slice(2, nlIndex);
        } else if (nlIndex >= 0) {
          // message format:
          //   |request|REQUEST
          //   |sentchoice|CHOICE
          if (data.slice(nlIndex + 1, nlIndex + 13) === '|sentchoice|') {
            choiceText = data.slice(nlIndex + 13);
          }
          data = data.slice(0, nlIndex);
        }

        try {
          requestData = JSON.parse(data);
        } catch (err) {}
        return this.receiveRequest(requestData, choiceText);
      }

      var log = data.split('\n');
      for (var i = 0; i < log.length; i++) {
        var logLine = log[i];

        if (logLine === '|') {
          this.callbackWaiting = false;
          this.controlsShown = false;
          this.$controls.html('');
        }

        if (logLine.substr(0, 10) === '|callback|') {
          // TODO: Maybe a more sophisticated UI for this.
          // In singles, this isn't really necessary because some elements of the UI will be
          // immediately disabled. However, in doubles/triples it might not be obvious why
          // the player is being asked to make a new decision without the following messages.
          var args = logLine.substr(10).split('|');
          var pokemon = isNaN(Number(args[1])) ? this.battle.getPokemon(args[1]) : this.battle.mySide.active[args[1]];
          var requestData = this.request.active[pokemon ? pokemon.slot : 0];
          delete this.choice;
          switch (args[0]) {
            case 'trapped':
              requestData.trapped = true;
              var pokeName = pokemon.side.n === 0 ? BattleLog.escapeHTML(pokemon.name) : "The opposing " + (this.battle.ignoreOpponent || this.battle.ignoreNicks ? pokemon.species : BattleLog.escapeHTML(pokemon.name));
              this.battle.activityQueue.push('|message|' + pokeName + ' is trapped and cannot switch!');
              break;
            case 'cant':
              for (var i = 0; i < requestData.moves.length; i++) {
                if (requestData.moves[i].id === args[3]) {
                  requestData.moves[i].disabled = true;
                }
              }
              args.splice(1, 1, pokemon.getIdent());
              this.battle.activityQueue.push('|' + args.join('|'));
              break;
          }
        } else if (logLine.substr(0, 7) === '|title|') { // eslint-disable-line no-empty
        } else if (logLine.substr(0, 5) === '|win|' || logLine === '|tie') {
          this.battleEnded = true;
          this.battle.activityQueue.push(logLine);
        } else if (logLine.substr(0, 6) === '|chat|' || logLine.substr(0, 3) === '|c|' || logLine.substr(0, 4) === '|c:|' || logLine.substr(0, 9) === '|chatmsg|' || logLine.substr(0, 10) === '|inactive|') {
          this.battle.instantAdd(logLine);
        } else {
          this.battle.activityQueue.push(logLine);
        }
      }
      this.battle.add('', Dex.prefs('noanim'));
      this.updateControls();
    },
	updateSide: function (sideData) {
			this.myPokemon = sideData.pokemon;
			for (var i = 0; i < sideData.pokemon.length; i++) {
				var pokemonData = sideData.pokemon[i];
				this.battle.parseDetails(pokemonData.ident.substr(4), pokemonData.ident, pokemonData.details, pokemonData);
				this.battle.parseHealth(pokemonData.condition, pokemonData);
				pokemonData.hpDisplay = Pokemon.prototype.hpDisplay;
				pokemonData.getPixelRange = Pokemon.prototype.getPixelRange;
				pokemonData.getFormattedRange = Pokemon.prototype.getFormattedRange;
				pokemonData.getHPColorClass = Pokemon.prototype.getHPColorClass;
				pokemonData.getHPColor = Pokemon.prototype.getHPColor;
			}
		},

};
