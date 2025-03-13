import { Test } from '@nestjs/testing';
import { UserService } from '../../modules/user/user.service';
import { ClsService } from 'nestjs-cls';
import { FollowService } from '../../modules/user/follow/follow.service';
import { getDataSourceToken } from '@nestjs/typeorm';
import { UserEntity } from '../../database/entities/User.entity';
import { ProfileEntity } from '../../database/entities/Profile.entity';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let userService: UserService;

  const mockUserRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockProfileRepo = {
    update: jest.fn(),
    increment: jest.fn(),
  };

  const mockCslService = {
    get: jest.fn(),
  };

  const mockFollowService = {
    acceptPendingRequests: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockImplementation((entity) => {
      if (entity === UserEntity) {
        return mockUserRepo;
      } else if (entity === ProfileEntity) {
        return mockProfileRepo;
      }
    }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: ClsService,
          useValue: mockCslService,
        },
        {
          provide: FollowService,
          useValue: mockFollowService,
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    let mockUser = {
      id: 1,
      username: 'john',
      email: 'john@div.edu.az',
      password: '12345',
      isPrivate: true,
    };

    mockUserRepo.findOne.mockImplementation((params) =>
      params.where.id === 1 ? mockUser : null,
    );

    it('should return user with given id', async () => {
      let result = await userService.getUser(1);
      expect(result).toEqual(mockUser);
      expect(mockUserRepo.findOne).toHaveBeenCalled();
    });
    it('should return null with invalid id', async () => {
      let result = await userService.getUser(1232231);
      expect(result).toBeNull();
      expect(mockUserRepo.findOne).toHaveBeenCalled();
    });
  });

  describe('getPublicProfile', () => {
    let mockUser = {
      id: 1,
      username: 'john',
      email: 'john@div.edu.az',
      password: '12345',
      isPrivate: true,
      profile: {
        id: 1,
        image: {
          url: 'http://image.com/image.png',
        },
      },
    };

    it('should return user with profile and image and removes password,email,phone', async () => {
      mockUserRepo.findOne.mockImplementation((params) =>
        params.where.id === 1 ? mockUser : null,
      );
      let result = await userService.getPublicProfile(1);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['profile', 'profile.image'],
      });

      expect(mockUserRepo.findOne).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        ...mockUser,
        password: undefined,
        email: undefined,
        phone: undefined,
      });
    });

    it('should return not found exception if id is not valid', async () => {
      mockUserRepo.findOne.mockImplementation((params) =>
        params.where.id === 1 ? mockUser : null,
      );
      expect(userService.getPublicProfile(34348)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
