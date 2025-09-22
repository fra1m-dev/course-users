import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@fra1m-dev/contracts-auth';
// import { UserStatsEntity } from './user-stats.entity';
// import { TokenEntity } from 'src/modules/auth/entities/token.entity';
// import { CourseEntity } from 'src/modules/courses/entities/course.entity';
// import { QuizEntity } from 'src/modules/quiz/entities/quiz.entity';
// import { SpecializationEntity } from 'src/modules/specialization/entities/specialization.entity';
// import { QuizAttemptEntity } from 'src/modules/analytics/entities/quiz-attempt.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'TestDeveloper',
    description: 'Имя пользователя',
  })
  @Column({ nullable: false })
  name: string;

  @ApiProperty({
    example: `user_${Math.random().toString(36).substring(7)}@example.com`,
    description: 'Почта пользователя',
  })
  @Column({ unique: true, nullable: false })
  email: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Роль пользователя',
  })
  @Column({ type: 'enum', enum: Role, default: Role.ADMIN })
  role: Role;

  // @OneToMany(() => QuizAttemptEntity, (att) => att.user, {
  //   onDelete: 'CASCADE',
  // })
  // attemt: QuizAttemptEntity | null;

  // @ManyToMany(() => CourseEntity, (course) => course.students)
  // @JoinTable({
  //   name: 'user_courses',
  //   joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
  //   inverseJoinColumns: [{ name: 'course_id', referencedColumnName: 'id' }],
  // })
  // enrolledCourses: CourseEntity[];

  // @ApiHideProperty()
  // @OneToMany(() => CourseEntity, (course) => course.teacher)
  // authoredCourses: CourseEntity[];

  // @ManyToOne(() => SpecializationEntity, (s) => s.students, {
  //   nullable: true,
  //   onDelete: 'SET NULL',
  // })
  // @JoinColumn({ name: 'specialization_id' })
  // specialization?: SpecializationEntity | null;

  // @ApiProperty({
  //   example: [QuizEntity],
  //   description: 'Массив токенов пользователя',
  // })
  // @OneToMany(() => QuizEntity, (quiz) => quiz.user, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
  // quizzes: QuizEntity[];

  // @OneToOne(() => UserStatsEntity, (stats) => stats.user, {
  //   cascade: ['insert', 'update'], // создаём/обновляем stats вместе с пользователем
  //   eager: true, // автоматически подтягивать stats (опционально)
  // })
  // @ApiProperty({
  //   type: () => UserStatsEntity,
  //   description: 'Статистика пользователя',
  // })
  // stats: UserStatsEntity;
}
