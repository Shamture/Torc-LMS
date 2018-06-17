(function () {

    const BLANK_STAGE = {stageid: null, title: '', videoUrl: '', questions: []};
    const BLANK_QUESTION = {questionid: null,question: '', explanation: '', options: []};
    const BLANK_OPTION = {optionid: null, text: '', isCorrect: false};

    var optionTemplate = [
        '<div class="form-group row">',
            '<label class="col-sm-2 col-form-label">Option {{optionindex + 1}}</label>',
            '<div class="col-sm-7">',
                '<input type="text" v-model="optionText" :class="[\'form-control\', {\'is-invalid\': wasValidated && !validOptionText}]" />',
                '<div class="invalid-feedback">Option text must be provided</div>',
            '</div>',
            '<div class="col-sm-2">',
                '<div class="form-check">',
                    '<input class="form-check-input" type="checkbox" :id="\'chbx-questionoption-\' + randId" v-model="isCorrect"><label class="form-check-label" :for="\'chbx-questionoption-\' + randId"><i class="fas fa-check-circle"></i></label>',
                '</div>',
            '</div>',
            '<div class="col-sm-1 text-right">',
                '<button class="btn btn-medium btn-light" @click="removeOption"><i class="fas fa-trash-alt"></i></button>',
            '</div>',
        '</div>',
    ].join('');

    Vue.component('course-creator-option', {
        props: ['course', 'stageindex', 'questionindex', 'optionindex'],
        template: optionTemplate,
        data: function () {
            return {
                optionText: this.course.stages[this.stageindex].questions[this.questionindex].options[this.optionindex].text,
                isCorrect: this.course.stages[this.stageindex].questions[this.questionindex].options[this.optionindex].isCorrect,
                randId: Util.guid()
            }
        },
        methods: {
            removeOption: function () {
                // TODO
            }
        },
        watch: {
            optionText: function (newVal) {
                this.course.stages[this.stageindex].questions[this.questionindex].options[this.optionindex].text = newVal;
            },
            isCorrect: function (newVal) {
                this.course.stages[this.stageindex].questions[this.questionindex].options[this.optionindex].isCorrect = newVal;
            }
        },
        computed: {
            wasValidated: function () {
                return this.course.wasValidated;
            },
            validOptionText: function () {
                return this.optionText.length > 0;
            },
        }
    });


    var questionTemplate = [
        '<div class="courseCreator-questions-tabInner">',
            '<div class="form-group">',
                '<label>Question</label>',
                '<input type="text" v-model="questionTitle" :class="[\'form-control\', {\'is-invalid\': wasValidated && !validQuestionTitle}]" />',
                '<div class="invalid-feedback">Question is required</div>',
            '</div>',
            '<div class="form-group">',
                '<label>Audio</label>',
                '<input type="text" v-model="questionAudio" class="form-control" />',
            '</div>',
            '<div class="courseCreator-questions-options">',
                '<h4>Options</h4>',
                '<course-creator-option v-for="(option, optionIndex) in options" :stageindex="stageindex" :questionindex="questionindex" :course="course" :optionindex="optionIndex" :key="optionIndex"></course-creator-option>',
                '<button class="btn btn-light" @click="addOption">Add Option  <i class="fas fa-plus-circle"></i></button>',
            '</div>',
        '</div>',
    ].join("");

    Vue.component('course-creator-question', {
        props: ['course', 'stageindex', 'questionindex'],
        template: questionTemplate,
        data: function () {
            return  {
                questionTitle: this.course.stages[this.stageindex].questions[this.questionindex].question,
                questionAudio: this.course.stages[this.stageindex].questions[this.questionindex].audio
            }
        },
        methods: {
            addOption: function () {
                this.course.stages[this.stageindex].questions[this.questionindex].options.push(Util.clone(BLANK_OPTION));
            }
        },
        watch: {
            questionTitle: function (newVal) {
                this.course.stages[this.stageindex].questions[this.questionindex].question = newVal;
            },
            questionAudio: function (newVal) {
                this.course.stages[this.stageindex].questions[this.questionindex].audio = newVal;
            }
        },
        computed: {
            wasValidated: function () {
                return this.course.wasValidated;
            },
            validQuestionTitle: function () {
                return this.questionTitle.length > 0;
            },
            options: function () {
                return this.course.stages[this.stageindex].questions[this.questionindex].options;
            }
        }
    });

    var stageTemplate = [
        '<div class="courseCreator-stageSingle">',
            '<div class="form-group">',
                '<label>Stage Title</label>',
                '<input type="text" v-model="title" :class="[\'form-control\', {\'is-invalid\': wasValidated && !validQuestionTitle}]" />',
                '<div class="invalid-feedback" >Stage Title is required</div>',
            '</div>',
            '<div class="form-group">',
                '<label>Video URL</label>',
                '<input type="text" v-model="videoUrl" :class="[\'form-control\', {\'is-invalid\': wasValidated && !validVideoUrl}]" />',
                '<div class="invalid-feedback">Video URL is required</div>',
            '</div>',
            '<div class="courseCreator-questions">',
                '<ul class="nav nav-tabs">',
                    '<li class="nav-item" v-for="(question, questionIndex) in questions">',
                        '<a :class="[\'nav-link\', {active: currentQuestionIndex === questionIndex}]" @click="changeQuestion(questionIndex)">Question {{questionIndex + 1}} <button class="btn btn-clear" @click.stop="removeQuestion(questionIndex)"><i class="fas fa-trash-alt"></i></button></a>',
                    '</li>',
                    '<li class="nav-item nav-buttonContainer"><button class="btn btn-secondary" @click="addQuestion">Add Question  <i class="fas fa-plus-circle"></i></button></li>',
                '</ul>',
                '<course-creator-question v-for="(question, questionIndex) in questions" :stageindex="stageindex" :questionindex="questionIndex" :course="course" :key="questionIndex" v-show="currentQuestionIndex === questionIndex"></course-creator-question>',
            '</div>',
        '</div>'
    ].join("");

    Vue.component('course-creator-stage', {
        props: ['stageindex', 'course'],
        //mixins: [commonMixin],
        template: stageTemplate,
        data: function () {
            return {
                title: this.course.stages[this.stageindex].title,
                videoUrl: this.course.stages[this.stageindex].videoUrl,
                currentQuestionIndex: null

            };
        },
        methods: {
            addQuestion: function () {
                this.course.stages[this.stageindex].questions.push(Util.clone(BLANK_QUESTION));
                this.currentQuestionIndex = this.course.stages[this.stageindex].questions.length - 1;
            },
            removeQuestion: function (questionIndex) {
                // TODO: Removing the wrong question
                this.course.stages[this.stageindex].questions.splice(questionIndex, 1);

                if (questionIndex === this.currentQuestionIndex && this.course.stages[this.stageindex].questions.length > 0) {
                    //Vue.set(stage, 'currentQuestionId', Object.keys(stage.questions)[0]);
                    this.currentQuestionIndex = 0;
                }
                // TODO: Set to null if there are no questions in this stage
            },
            changeQuestion: function (questionIndex) {
                this.currentQuestionIndex = questionIndex;
            }
        },
        computed: {
            questions: function () {
                return this.course.stages[this.stageindex].questions;
            },
            wasValidated: function () {
                return this.course.wasValidated;
            },
            validQuestionTitle: function () {
                return this.title.length > 0;
            },
            validVideoUrl: function () {
                return this.videoUrl.length > 0;
            }
        },
        watch: {
            title: function (newVal) {
                this.course.stages[this.stageindex].title = newVal;
            },
            videoUrl: function (newVal) {
                this.course.stages[this.stageindex].videoUrl = newVal;
            }
        }
    });

    var template = [
        '<div :class="[\'courseCreator\', {wasValidated: course.wasValidated}]">',
            '<div class="courseCreator-form">',
                '<div class="form-group">',
                    '<label>Course Title</label>',
                    '<input type="text" v-model="course.title" :class="[\'form-control\', {\'is-invalid\': course.wasValidated && !validCourseTitle}]"/>',
                    '<div class="invalid-feedback" >Course Title is required</div>',
                '</div>',
                '<div class="courseCreator-stages">',
                    '<ul class="nav nav-tabs courseCreator-stages-tabs">',
                        '<li class="nav-item" v-for="(stage, stageIndex) in stages">',
                            '<a :class="[\'nav-link\', {active: stageIndex === currentStageIndex}]" @click="changeStage(stageIndex)">Stage {{stageIndex + 1}} <button class="btn btn-clear" @click.stop="removeStage(stageIndex)"><i class="fas fa-trash-alt"></i></button></a>',
                        '</li>',
                        '<li class="nav-item nav-buttonContainer"><button class="btn btn-primary" @click="addStage">Add a Stage  <i class="fas fa-plus-circle"></i></button></li>',
                    '</ul>',
                    '<course-creator-stage v-for="(stage, stageIndex) in stages" v-show="stageIndex === currentStageIndex" :course="course" :stageindex="stageIndex" :key="stageIndex"></course-creator-stage>',
                '</div>', // courseCreator-stages
                '<div class="courseCreator-actions">',
                    '<button @click="saveCourse" class="btn btn-primary">Save</button>',
                    '<button @click="clearForm" class="btn btn-secondary">Clear Form</button>',
                '</div>', // courseCreator-actions
            '</div>', // courseCreator-form
        '</div>', // courseCreator
    ].join('');

    Vue.component('course-creator', {
        props: {
            course: {
                default: function () {
                    return {
                        title: '',
                        stages: [],
                        // TODO: Need to move this out of course
                        wasValidated: false
                    }
                }
            }
        },
        template: template,
        data: function () {
            return {
                currentStageIndex: null
            }
        },
        computed: {
            stages: function () {
                return this.course.stages;
            },
            validCourseTitle: function () {
                return this.course.title.length > 0;
            }
        },
        methods: {
            saveCourse: function () {
                this.course.wasValidated = true;

                console.log(JSON.stringify(this.course));

                //this.$store.commit('setWasValidated', true);

                // TODO: Need to validate entire is valid
                //if (this.validateCourses()) {
                //this.$store.commit('saveCourse', this.course);
                //this.$store.dispatch('saveCourse');
                //}

                /*
                fetch('/lms/api/courses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(course)
                }).then(function (response) {
                    console.log(response);
                });
                 */
            },
            clearForm: function () {
                // TODO: Place in variable
                // TODO: Copy course into data property
                this.course = {
                    title: '',
                    stages: [],
                    // TODO: Need to move this out of course
                    wasValidated: false
                };
            },
            addStage: function () {
                this.course.stages.push(Util.clone(BLANK_STAGE));
                this.currentStageIndex = this.course.stages.length - 1;
            },
            removeStage: function (stageIndex) {
                // TODO: removing the wrong stage
                this.course.stages.splice(stageIndex, 1);

                if (stageIndex === this.currentStageIndex && this.course.stages.length > 0) {
                    this.currentStageIndex = 0;
                }
                // TODO: Set currentStageIndex to null if there are no stages
            },
            changeStage: function (stageIndex) {
                this.currentStageIndex = stageIndex;
            }
        }
    });

})();