class ApplePlayer extends Player {
    buttons: Element;

    constructor() {
        super("apple");
    }

    init(): void {
        //console.log("init");
        let webChrome = document.querySelector('.web-chrome');
        if (webChrome == null) {
            this.waitForElement(document.querySelector('body'), (el) => {
                return el.nodeName == 'APPLE-MUSIC-VIDEO-PLAYER';
            }, () => {
                this.addMainObserver(document.querySelector('.web-chrome') as Element);
            });
        } else {
            this.addMainObserver(webChrome);
        }
    }


    addMainObserver(webChrome: Element) {
        this.buttons = webChrome.querySelector('.web-chrome-playback-controls__main');

        let updateButton = (button: HTMLElement) => {
            if (button.nodeName !== 'BUTTON') {
                return;
            }

            if (button.classList.contains('web-chrome-playback-controls__playback-btn')) {
                if (this.info.status != "Playing" && 'testPlaybackControlPause' in button.dataset) {
                    this.setPlaying();
                } else if (this.info.status != "Paused" && 'testPlaybackControlPlay' in button.dataset) {
                    if (button.hasAttribute('disabled')) {
                        this.set({status: "Stopped", can_play: false});
                    } else {
                        this.setPaused();
                    }
                }

                if ('testPlaybackControlNext' in button.dataset) {
                    this.set({can_go_next: !button.hasAttribute('disabled')});
                } else if ('testPlaybackControlPrevious' in button.dataset) {
                    this.set({can_go_previous: !button.hasAttribute('disabled')});
                }
            }
        };

        let buttonsObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                updateButton(mutation.target as HTMLElement);
            });
        });

        buttonsObserver.observe(this.buttons, {
            attributes: true,
            childList: true,
            // attributeFilter: ['data-test-playback-control-pause', 'data-test-playback-control-play'],
            subtree: true
        });

        [...this.buttons.children].forEach(updateButton);


        let nowPlaying = webChrome.querySelector('.web-chrome-playback-lcd__now-playing-container');
        if (null === nowPlaying) {
            this.waitForElement(document.querySelector('.web-chrome-playback-lcd'), (el) => {
                return el.nodeName == 'AUDIO';
            }, () => {
                this.addNowPlayingObserver(document.querySelector('.web-chrome-playback-lcd__now-playing-container') as Element);
            });
        } else {
            this.addNowPlayingObserver(nowPlaying as Element);
        }
    }

    addNowPlayingObserver(el: Element) {
        const setContents = ((el: Element) => {
            const presentation = el.querySelector('*[role="presentation"]');
            if (!presentation) {
                this.set({title: ''})
            } else {
                this.set({title: presentation.textContent});
            }

            const img = document.querySelector('.web-chrome img.media-artwork-v2__image') as HTMLImageElement;
            if (img !== null) {
                let url = img.srcset.match(/\bhttps?:\/\/[^ ,]+/g).pop() || img.src;
                this.set({art_url: url});
            }
        });
        //console.log("Now playing observer");
        let observer = new MutationObserver((mutations) => {
            setContents(el);
        });

        observer.observe(el, {
            characterData: true,
            attributes: true,
            attributeFilter: ['class'],
            subtree: true,
            childList: true
        });

        setContents(el);
    }

    play(): void {
        this.playPause();
    }
    pause(): void {
        this.playPause();
    }

    playPause(): void {
        this.click('*[data-test-playback-control-play], *[data-test-playback-control-pause]');
    }
    next(): void {
        this.click('*[data-test-playback-control-next]');
    }
    previous(): void {
        this.click('*[data-test-playback-control-previous]');
    }
    click(selector: string): void {
        let button = (this.buttons.querySelector(selector) as HTMLElement);
        if (button) button.click();
    }
}

{
    let player = new ApplePlayer();
    player.init();
}
